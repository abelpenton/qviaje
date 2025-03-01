import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Package from '@/models/Package';
import Agency from '@/models/Agency';
import Review from '@/models/Review';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);

        // Pagination parameters
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '9');
        const skip = (page - 1) * limit;

        // Filter parameters
        const agencyId = searchParams.get('agencyId');
        const featured = searchParams.get('featured') === 'true';
        const destination = searchParams.get('destination');
        const category = searchParams.getAll('category');
        const minPrice = searchParams.get('minPrice');
        const maxPrice = searchParams.get('maxPrice');
        const status = searchParams.get('status') ? [searchParams.get('status')] : ['Listado']; // Default to listed packages
        const date = searchParams.get('date');
        const minDuration = searchParams.get('minDuration');
        const maxDuration = searchParams.get('maxDuration');
        const travelers = searchParams.get('travelers');

        // Build the query
        let query: any = {};

        // Filter by agency if specified
        if (agencyId) {
            query.agencyId = new ObjectId(agencyId);
        }

        // Filter by status (default to 'Listado')
        query.status = { $in: status };

        // Filter by destination if specified
        if (destination) {
            query.destination = { $regex: destination, $options: 'i' };
        }

        // Filter by category if specified
        if (category && category.length > 0) {
            query.category = { $in: category };
        }

        // Filter by price range if specified
        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = parseFloat(minPrice);
            if (maxPrice) query.price.$lte = parseFloat(maxPrice);
        }

        // Filter by date if specified
        if (date) {
            const selectedDate = new Date(date);
            // Find packages with start dates on or after the selected date
            query['startDates.date'] = { $gte: selectedDate };
        }

        // Filter by duration if specified
        if (minDuration || maxDuration) {
            query['duration.days'] = {};
            if (minDuration) query['duration.days'].$gte = parseInt(minDuration);
            if (maxDuration) query['duration.days'].$lte = parseInt(maxDuration);
        }

        // Filter by travelers if specified
        if (travelers) {
            const travelersCount = parseInt(travelers);
            query.minPeople = { $lte: travelersCount };
            query.maxPeople = { $gte: travelersCount };
        }

        // Count total packages matching the query
        const total = await Package.countDocuments(query);

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        // Get packages with pagination
        const packages = await Package.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        // Get reviews for each package
        const packagesWithReviews = await Promise.all(
            packages.map(async (pkg) => {
                // Get reviews count and average rating
                const reviews = await Review.find({ packageId: pkg._id });
                const reviewCount = reviews.length;
                let averageRating = 0;

                if (reviewCount > 0) {
                    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                    averageRating = parseFloat((totalRating / reviewCount).toFixed(1));
                }

                return {
                    ...pkg.toObject(),
                    rating: averageRating,
                    reviews: reviewCount
                };
            })
        );

        return NextResponse.json({
            packages: packagesWithReviews,
            page,
            limit,
            total,
            totalPages
        });
    } catch (error) {
        console.error('Error al obtener los paquetes:', error);
        return NextResponse.json(
            { error: 'Error al obtener los paquetes' },
            { status: 500 }
        );
    }
}