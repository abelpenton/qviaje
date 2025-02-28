// /paquetes/[id]/page.tsx
import { notFound } from 'next/navigation';
import PackageDetail from './PackageDetail';
import dbConnect from '@/lib/db';
import Package from '@/models/Package';
import Agency from '@/models/Agency';
import Review from '@/models/Review';

// This function is called at request time
export async function generateMetadata({ params }) {
  const { id } = params;

  try {
    await dbConnect();
    const packageData = await Package.findById(id);

    if (!packageData) {
      return {
        title: 'Paquete no encontrado',
      };
    }

    return {
      title: packageData.title,
      description: packageData.description,
    };
  } catch (error) {
    console.error('Error al obtener metadatos del paquete:', error);
    return {
      title: 'Detalles del paquete',
    };
  }
}

async function getPackageData(id) {
  try {
    await dbConnect();

    // Obtener el paquete
    const packageData = await Package.findById(id).lean();

    if (!packageData) {
      return null;
    }

    // Obtener la agencia
    const agency = await Agency.findById(packageData.agencyId)
        .select('name logo description rating reviews location phone email website verified reviews rating')
        .lean();

    const agencyPackages = await Package.find({ agencyId: packageData.agencyId }).lean();
    const agencyReviewsByPackages = await Review.find({ packageId: { $in: agencyPackages.map(pkg => pkg._id) } }).lean();
    const averageAgencyRating = agencyReviewsByPackages.length > 0 ? parseFloat((agencyReviewsByPackages.reduce((sum, review) => sum + review.rating, 0) / agencyReviewsByPackages.length).toFixed(1)) : 0;

    // Obtener las reseñas
    const reviews = await Review.find({ packageId: id })
        .populate('userId', 'name photo')
        .sort({ createdAt: -1 })
        .lean();

    // Calcular el rating promedio
    let totalRating = 0;
    const reviewCount = reviews.length;

    if (reviewCount > 0) {
      totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    }

    const averageRating = reviewCount > 0 ? parseFloat((totalRating / reviewCount).toFixed(1)) : 0;

    // Transformar el objeto para que coincida con la estructura esperada por el componente
    return {
      id: packageData._id.toString(),
      title: packageData.title,
      subtitle: packageData.description.substring(0, 100) + '...',
      description: packageData.description,
      location: packageData.destination,
      images: packageData.images.map(img => img.url || img),
      price: packageData.price,
      rating: averageRating,
      reviews: reviewCount,
      dates: `${packageData.duration.days} días / ${packageData.duration.nights} noches`,
      minPeople: packageData.minPeople || 1,
      maxPeople: packageData.maxPeople,
      startDates: packageData.startDates || [],
      included: packageData.included,
      notIncluded: packageData.notIncluded,
      itinerary: packageData.itinerary || [],
      agency: agency ? {
        id: agency._id.toString(),
        name: agency.name,
        logo: agency.logo,
        description: agency.description,
        rating: averageAgencyRating,
        reviews: agencyReviewsByPackages.length,
        verified: agency.verified,
        location: agency.location,
        phone: agency.phone,
        email: agency.email,
        website: agency.website,
      } : null,
      category: packageData.category || [],
      reviewsList: reviews.map(review => ({
        _id: review._id.toString(),
        userId: {
          _id: review.userId._id.toString(),
          name: review.userId.name,
          photo: review.userId.photo
        },
        rating: review.rating,
        comment: review.comment,
        images: review.images || [],
        createdAt: review.createdAt
      }))
    };
  } catch (error) {
    console.error('Error al obtener el paquete:', error);
    return null;
  }
}

// Función para obtener paquetes similares
async function getSimilarPackages(packageData, limit = 3) {
  if (!packageData) return [];

  try {
    await dbConnect();

    // Buscar por destino similar o categorías similares
    const query = {
      _id: { $ne: packageData.id }, // Excluir el paquete actual
      $or: [
        { destination: { $regex: packageData.location, $options: 'i' } },
        { category: { $in: packageData.category } }
      ],
      status: 'Listado' // Solo paquetes publicados
    };

    const similarPackages = await Package.find(query)
        .limit(limit)
        .lean();

    const packagesWithRatings = await Promise.all(
        similarPackages.map(async (pkg) => {
          const reviews = await Review.find({ packageId: pkg._id });
          const reviewCount = reviews.length;
          let averageRating = 0;

          if (reviewCount > 0) {
            const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
            averageRating = parseFloat((totalRating / reviewCount).toFixed(1));
          }

          return {
            id: pkg._id.toString(),
            title: pkg.title,
            subtitle: pkg.description.substring(0, 100) + '...',
            location: pkg.destination,
            image: pkg.images[0]?.url || '',
            price: pkg.price,
            rating: averageRating,
            reviews: reviewCount,
            dates: `${pkg.duration.days} días / ${pkg.duration.nights} noches`,
            tags: pkg.category || [],
          };
        })
    );

    return packagesWithRatings;
  } catch (error) {
    console.error('Error al obtener paquetes similares:', error);
    return [];
  }
}

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const packageData = await getPackageData(params.id);

  if (!packageData) {
    notFound();
  }

  // Obtener paquetes similares
  const similarPackages = await getSimilarPackages(packageData);

  return <PackageDetail packageData={packageData} similarPackages={similarPackages} />;
}