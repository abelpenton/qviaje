import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Agency from '@/models/Agency';
import Package from '@/models/Package';
import Review from '@/models/Review';

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

        // Get package counts and update ratings for each agency
        const agenciesWithData = await Promise.all(
            agencies.map(async (agency) => {
                // Count packages
                const packageCount = await Package.countDocuments({
                    agencyId: agency._id,
                    status: 'Listado' // Only count published packages
                });

                // Get all packages from this agency
                const packages = await Package.find({ agencyId: agency._id });
                const packageIds = packages.map(pkg => pkg._id);

                // Get all reviews for this agency's packages
                const reviews = await Review.find({
                    packageId: { $in: packageIds }
                });

                // Calculate average rating
                let totalRating = 0;
                const reviewCount = reviews.length;

                if (reviewCount > 0) {
                    totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                }

                const averageRating = reviewCount > 0 ? (totalRating / reviewCount).toFixed(1) : '0.0';
                // Update agency with new rating and review count if needed
                if (agency.rating !== parseFloat(averageRating) || agency.reviews !== reviewCount) {
                    await Agency.findByIdAndUpdate(
                        agency._id,
                        {
                            rating: parseFloat(averageRating),
                            reviews: reviewCount
                        }
                    );
                }

                return {
                    ...agency.toObject(),
                    totalPackages: packageCount,
                    rating: parseFloat(averageRating),
                    reviews: reviewCount
                };
            })
        );

        return NextResponse.json(agenciesWithData);
    } catch (error) {
        console.error('Error al obtener las agencias:', error);
        return NextResponse.json(
            { error: 'Error al obtener las agencias' },
            { status: 500 }
        );
    }
}