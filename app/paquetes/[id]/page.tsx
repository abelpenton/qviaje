// /paquetes/[id]/page.tsx
import { notFound } from 'next/navigation';
import PackageDetail from './PackageDetail';
import dbConnect from '@/lib/db';
import Package from '@/models/Package';

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
    const packageData = await Package.findById(id)
        .populate('agencyId', 'name logo description rating reviews location phone email website')
        .lean();

    if (!packageData) {
      return null;
    }

    // Transformar el objeto para que coincida con la estructura esperada por el componente
    return {
      id: packageData._id.toString(),
      title: packageData.title,
      subtitle: packageData.description.substring(0, 100) + '...',
      location: packageData.destination,
      images: packageData.images.map(img => img.url),
      price: packageData.price,
      rating: packageData.agencyId?.rating || 4.5,
      reviews: packageData.agencyId?.reviews || 0,
      dates: `${packageData.duration.days} días / ${packageData.duration.nights} noches`,
      minPeople: packageData.minPeople,
      maxPeople: packageData.maxPeople,
      startDates: packageData.startDates || [],
      included: packageData.included,
      notIncluded: packageData.notIncluded,
      itinerary: packageData.itinerary || [],
      agency: packageData.agencyId ? {
        id: packageData.agencyId._id.toString(),
        name: packageData.agencyId.name,
        logo: packageData.agencyId.logo,
        description: packageData.agencyId.description,
        rating: packageData.agencyId.rating,
        reviews: packageData.agencyId.reviews,
        verified: true,
        location: packageData.agencyId.location,
        phone: packageData.agencyId.phone,
        email: packageData.agencyId.email,
        website: packageData.agencyId.website,
      } : null,
      reviews: [], // Podríamos agregar reseñas en el futuro
    };
  } catch (error) {
    console.error('Error al obtener el paquete:', error);
    return null;
  }
}

export default async function PackageDetailPage({ params }: { params: { id: string } }) {
  const packageData = await getPackageData(params.id);

  return <PackageDetail packageData={packageData} />;
}