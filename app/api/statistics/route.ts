//@ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Statistic from '@/models/Statistic';
import Package from '@/models/Package';
import { authOptions } from '@/lib/auth';
import { subDays, startOfDay, endOfDay, format } from 'date-fns';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();
        const agencyId = new ObjectId(session.user.id);

        // Obtener parámetros de consulta
        const { searchParams } = new URL(request.url);
        const period = searchParams.get('period') || 'week';

        // Determinar el rango de fechas según el período
        const today = new Date();
        const daysToSubtract = period === 'week' ? 7 : 30;
        const startDate = startOfDay(subDays(today, daysToSubtract));
        const previousStartDate = startOfDay(subDays(today, daysToSubtract * 2));


        // Obtener estadísticas de paquetes
        const packagesStats = await Package.aggregate([
            { $match: { agencyId } },
            { $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Contar paquetes activos y totales
        const activePackages = packagesStats.find(stat => stat._id === 'Listado')?.count || 0;
        const totalPackages = packagesStats.reduce((acc, stat) => acc + stat.count, 0);

        // Obtener vistas y consultas del período actual
        const currentPeriodStats = await Statistic.aggregate([
            {
                $match: {
                    agencyId,
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const weeklyViews = currentPeriodStats.find(stat => stat._id === 'view')?.count || 0;
        const weeklyInquiries = currentPeriodStats.find(stat => stat._id === 'inquiry')?.count || 0;

        // Obtener vistas y consultas del período anterior para comparación
        const previousPeriodStats = await Statistic.aggregate([
            {
                $match: {
                    agencyId,
                    createdAt: { $gte: previousStartDate, $lt: startDate }
                }
            },
            {
                $group: {
                    _id: '$type',
                    count: { $sum: 1 }
                }
            }
        ]);

        const previousViews = previousPeriodStats.find(stat => stat._id === 'view')?.count || 0;
        const previousInquiries = previousPeriodStats.find(stat => stat._id === 'inquiry')?.count || 0;

        // Calcular cambio porcentual
        const viewsChange = previousViews > 0
            ? Math.round(((weeklyViews - previousViews) / previousViews) * 100)
            : 0;
        const inquiriesChange = previousInquiries > 0
            ? Math.round(((weeklyInquiries - previousInquiries) / previousInquiries) * 100)
            : 0;

        // Obtener estadísticas diarias para el gráfico
        const days = Array.from({ length: daysToSubtract }, (_, i) => {
            const date = subDays(today, daysToSubtract - 1 - i);
            return {
                date: format(date, 'yyyy-MM-dd'),
                start: startOfDay(date),
                end: endOfDay(date)
            };
        });

        const dailyStats = await Promise.all(days.map(async (day) => {
            const dayStats = await Statistic.aggregate([
                {
                    $match: {
                        agencyId,
                        createdAt: { $gte: day.start, $lte: day.end }
                    }
                },
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 }
                    }
                }
            ]);

            return {
                date: day.date,
                views: dayStats.find(stat => stat._id === 'view')?.count || 0,
                inquiries: dayStats.find(stat => stat._id === 'inquiry')?.count || 0
            };
        }));

        // Obtener los paquetes más populares
        const packageViews = await Statistic.aggregate([
            {
                $match: {
                    agencyId,
                    type: 'view',
                    packageId: { $exists: true },
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$packageId',
                    views: { $sum: 1 }
                }
            },
            { $sort: { views: -1 } },
            { $limit: 5 }
        ]);

        // Obtener detalles de los paquetes más vistos
        const topPackageIds = packageViews.map(pkg => pkg._id);
        const topPackagesDetails = await Package.find({ _id: { $in: topPackageIds } })
            .select('title status');

        // Obtener consultas por paquete
        const packageInquiries = await Statistic.aggregate([
            {
                $match: {
                    agencyId,
                    type: 'inquiry',
                    packageId: { $in: topPackageIds },
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$packageId',
                    inquiries: { $sum: 1 }
                }
            }
        ]);

        // Combinar datos para los paquetes más populares
        const topPackages = topPackagesDetails.map(pkg => {
            const views = packageViews.find(v => v._id.toString() === pkg._id.toString())?.views || 0;
            const inquiries = packageInquiries.find(i => i._id.toString() === pkg._id.toString())?.inquiries || 0;

            return {
                id: pkg._id,
                title: pkg.title,
                status: pkg.status,
                views,
                inquiries
            };
        }).sort((a, b) => b.views - a.views);

        return NextResponse.json({
            activePackages,
            totalPackages,
            weeklyViews,
            weeklyInquiries,
            viewsChange,
            inquiriesChange,
            dailyStats,
            topPackages
        });
    } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        );
    }
}