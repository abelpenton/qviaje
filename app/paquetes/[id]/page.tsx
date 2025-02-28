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
      difficulty: "Moderado", // Podríamos agregar este campo al modelo en el futuro
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
      category: packageData.category || [],
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

    return similarPackages.map(pkg => ({
      id: pkg._id.toString(),
      title: pkg.title,
      subtitle: pkg.description.substring(0, 100) + '...',
      location: pkg.destination,
      image: pkg.images[0]?.url || '',
      price: pkg.price,
      rating: 4.8, // Valor por defecto
      reviews: 150, // Valor por defecto
      dates: `${pkg.duration.days} días / ${pkg.duration.nights} noches`,
      tags: pkg.category || [],
      difficulty: "Moderado" // Valor por defecto
    }));
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