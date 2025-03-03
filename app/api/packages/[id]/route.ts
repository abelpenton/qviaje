//@ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Package from '@/models/Package';
import Review from '@/models/Review';
import Agency from '@/models/Agency';
import { authOptions } from '@/lib/auth';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Obtener un paquete específico
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    const { id } = params;

    const packageData = await Package.findById(id);

    if (!packageData) {
      return NextResponse.json(
          { error: 'Paquete no encontrado' },
          { status: 404 }
      );
    }

    // Obtener la agencia asociada al paquete
    const agency = await Agency.findById(packageData.agencyId).select('-password');

    // Obtener las reseñas del paquete
    const reviews = await Review.find({ packageId: id })
        .populate('userId', 'name photo')
        .sort({ createdAt: -1 });

    // Calcular el rating promedio
    let averageRating = 0;
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      averageRating = parseFloat((totalRating / reviews.length).toFixed(1));
    }

    // Combinar toda la información
    const packageWithDetails = {
      ...packageData.toObject(),
      agency: agency ? agency.toObject() : null,
      reviews: reviews,
      rating: averageRating,
      reviewCount: reviews.length
    };

    return NextResponse.json(packageWithDetails);
  } catch (error) {
    console.error('Error al obtener el paquete:', error);
    return NextResponse.json(
        { error: 'Error al obtener el paquete' },
        { status: 500 }
    );
  }
}

// PUT - Actualizar un paquete
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();
    const { id } = params;

    // Verificar que el paquete exista y pertenezca a la agencia
    const packageToUpdate = await Package.findOne({
      _id: id,
      agencyId: session.user.id
    });

    if (!packageToUpdate) {
      return NextResponse.json(
          { error: 'Paquete no encontrado o no autorizado' },
          { status: 404 }
      );
    }

    // Parse FormData
    const formData = await request.formData();

    // Extraer las imágenes actuales
    const currentImagesStr = formData.get('currentImages');
    let currentImages = [];
    if (currentImagesStr) {
      try {
        currentImages = JSON.parse(currentImagesStr);
      } catch (e) {
        console.error('Error al parsear las imágenes actuales:', e);
      }
    }

    // Extraer los archivos de imágenes nuevas
    const files = formData.getAll('images');
    let newImages = [];

    // Subir nuevas imágenes a Cloudinary si existen
    if (files && files.length > 0 && files[0]) {
      newImages = await Promise.all(
          files.map(async (file) => {
            const buffer = await file.arrayBuffer();
            const base64Image = Buffer.from(buffer).toString('base64');
            const uploadResponse = await cloudinary.v2.uploader.upload(`data:image/jpeg;base64,${base64Image}`);
            return {
              url: uploadResponse.secure_url,
              alt: formData.get('title') || 'Imagen del paquete'
            };
          })
      );
    }

    // Combinar imágenes actuales y nuevas
    const allImages = [...currentImages, ...newImages];

    // Procesar las fechas de salida
    let startDates = [];
    const startDatesStr = formData.get('startDates');
    if (startDatesStr) {
      try {
        startDates = JSON.parse(startDatesStr);
      } catch (e) {
        console.error('Error al parsear las fechas de salida:', e);
      }
    }

    // Procesar el itinerario
    let itinerary = [];
    const itineraryStr = formData.get('itinerary');
    if (itineraryStr) {
      try {
        itinerary = JSON.parse(itineraryStr);
      } catch (e) {
        console.error('Error al parsear el itinerario:', e);
      }
    }

    // Procesar las categorías
    let category = [];
    const categoryStr = formData.get('category');
    if (categoryStr) {
      try {
        category = JSON.parse(categoryStr);
      } catch (e) {
        console.error('Error al parsear las categorías:', e);
      }
    }

    // Procesar la duración
    let duration = { days: 1, nights: 0 };
    const durationStr = formData.get('duration');
    if (durationStr) {
      try {
        duration = JSON.parse(durationStr);
      } catch (e) {
        console.error('Error al parsear la duración:', e);
      }
    }

    // Preparar los datos para la actualización
    const updateData = {
      title: formData.get('title'),
      description: formData.get('description'),
      destination: formData.get('destination'),
      price: parseFloat(formData.get('price')),
      discountPercentage: parseFloat(formData.get('discountPercentage') || 0),
      duration: duration,
      included: formData.get('included').split('\n').map(item => item.trim()),
      notIncluded: formData.get('notIncluded').split('\n').map(item => item.trim()),
      minPeople: parseInt(formData.get('minPeople')),
      maxPeople: parseInt(formData.get('maxPeople')),
      startDates: startDates,
      itinerary: itinerary,
      category: category,
      updatedAt: new Date()
    };

    // Solo actualizar las imágenes si hay nuevas
    if (allImages.length > 0) {
      updateData.images = allImages;
    }

    // Actualizar el paquete
    const updatedPackage = await Package.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
    );

    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error('Error al actualizar el paquete:', error);
    return NextResponse.json(
        { error: 'Error al actualizar el paquete' },
        { status: 500 }
    );
  }
}

// DELETE - Eliminar un paquete
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();
    const { id } = params;

    // Verificar que el paquete exista y pertenezca a la agencia
    const packageToDelete = await Package.findOne({
      _id: id,
      agencyId: session.user.id
    });

    if (!packageToDelete) {
      return NextResponse.json(
          { error: 'Paquete no encontrado o no autorizado' },
          { status: 404 }
      );
    }

    // Eliminar el paquete
    await Package.findByIdAndDelete(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar el paquete:', error);
    return NextResponse.json(
        { error: 'Error al eliminar el paquete' },
        { status: 500 }
    );
  }
}