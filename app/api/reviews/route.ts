//@ts-nocheck
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Review from '@/models/Review';
import Package from '@/models/Package';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Obtener reseñas para un paquete específico
export async function GET(request: Request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const packageId = searchParams.get('packageId');

        if (!packageId) {
            return NextResponse.json(
                { error: 'Se requiere el ID del paquete' },
                { status: 400 }
            );
        }

        // Verificar que el paquete exista
        const packageExists = await Package.findById(packageId);
        if (!packageExists) {
            return NextResponse.json(
                { error: 'Paquete no encontrado' },
                { status: 404 }
            );
        }

        // Obtener las reseñas del paquete con información del usuario
        const reviews = await Review.find({ packageId })
            .populate('userId', 'name photo')
            .sort({ createdAt: -1 });

        return NextResponse.json(reviews);
    } catch (error) {
        console.error('Error al obtener reseñas:', error);
        return NextResponse.json(
            { error: 'Error al obtener reseñas' },
            { status: 500 }
        );
    }
}

// POST - Crear una nueva reseña
export async function POST(request: Request) {
    try {
        await dbConnect();

        // Parse FormData (multipart/form-data)
        const formData = await request.formData();

        // Extraer datos del formulario
        const userId = formData.get('userId') as string;
        const packageId = formData.get('packageId') as string;
        const rating = formData.get('rating') as string;
        const comment = formData.get('comment') as string;

        // Validar campos requeridos
        if (!userId || !packageId || !rating || !comment) {
            return NextResponse.json(
                { error: 'Todos los campos son requeridos' },
                { status: 400 }
            );
        }

        // Verificar que el paquete exista
        const packageExists = await Package.findById(packageId);
        if (!packageExists) {
            return NextResponse.json(
                { error: 'Paquete no encontrado' },
                { status: 404 }
            );
        }

        // Procesar imágenes si se proporcionan
        const files = formData.getAll('images');
        let uploadedImages = [];

        if (files && files.length > 0) {
            uploadedImages = await Promise.all(
                files.map(async (file) => {
                    if (file instanceof File) {
                        const buffer = await file.arrayBuffer();
                        const base64Image = Buffer.from(buffer).toString('base64');
                        const uploadResponse = await cloudinary.v2.uploader.upload(`data:image/jpeg;base64,${base64Image}`);
                        return {
                            url: uploadResponse.secure_url,
                            alt: 'Imagen de reseña'
                        };
                    }
                    return null;
                })
            ).then(images => images.filter(Boolean));
        }

        // Crear la reseña
        const review = await Review.create({
            userId,
            packageId,
            rating: parseInt(rating),
            comment,
            images: uploadedImages,
        });

        // Obtener la reseña con información del usuario
        const populatedReview = await Review.findById(review._id)
            .populate('userId', 'name photo');

        return NextResponse.json(populatedReview, { status: 201 });
    } catch (error) {
        console.error('Error al crear reseña:', error);
        return NextResponse.json(
            { error: 'Error al crear reseña' },
            { status: 500 }
        );
    }
}