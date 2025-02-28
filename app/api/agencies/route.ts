import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Agency from '@/models/Agency';
import Package from '@/models/Package';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const verified = searchParams.get('verified') === 'true';
        const name = searchParams.get('name');
        const location = searchParams.get('location');

        // Build the query
        let query: any = {};

        // Filter by verification status if specified
        if (verified) {
            query.verified = true;
        }

        // Filter by name if specified
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }

        // Filter by location if specified
        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        // Get agencies
        const agencies = await Agency.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        // Get package counts for each agency
        const agenciesWithPackageCounts = await Promise.all(
            agencies.map(async (agency) => {
                const packageCount = await Package.countDocuments({
                    agencyId: agency._id,
                    status: 'Listado' // Only count published packages
                });

                return {
                    ...agency.toObject(),
                    totalPackages: packageCount
                };
            })
        );

        return NextResponse.json(agenciesWithPackageCounts);
    } catch (error) {
        console.error('Error al obtener las agencias:', error);
        return NextResponse.json(
            { error: 'Error al obtener las agencias' },
            { status: 500 }
        );
    }
}