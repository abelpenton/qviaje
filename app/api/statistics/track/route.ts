import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Statistic from '@/models/Statistic';
import Package from '@/models/Package';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { packageId, agencyId, type } = await request.json();
        console.log(type)

        // Validar los datos
        if (!agencyId) {
            return NextResponse.json({ error: 'ID de agencia requerido' }, { status: 400 });
        }

        if (!type || !['view', 'inquiry'].includes(type)) {
            return NextResponse.json({ error: 'Tipo de estadística inválido' }, { status: 400 });
        }

        // Si se proporciona un packageId, verificar que exista
        if (packageId) {
            const packageExists = await Package.findById(packageId);
            if (!packageExists) {
                return NextResponse.json({ error: 'Paquete no encontrado' }, { status: 404 });
            }
        }


        // Crear la estadística
        const statistic = await Statistic.create({
            packageId: packageId || null,
            agencyId,
            type,
            createdAt: new Date()
        });

        return NextResponse.json({ success: true, statistic });
    } catch (error) {
        console.error('Error al registrar estadística:', error);
        return NextResponse.json(
            { error: 'Error al registrar estadística' },
            { status: 500 }
        );
    }
}