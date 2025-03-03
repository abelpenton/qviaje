//@ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Package from '@/models/Package';
import Agency from '@/models/Agency';
import Review from '@/models/Review';
import Statistic from '@/models/Statistic';
import * as z from 'zod';
import { authOptions } from '@/lib/auth';
import cloudinary from 'cloudinary';
import { ObjectId } from 'mongodb';

cloudinary.v2.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Definir el esquema de validación con Zod
const formSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  destination: z.string().min(3, 'El destino debe tener al menos 3 caracteres'),
  price: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, 'Precio debe ser un número válido con hasta dos decimales')
      .min(1, 'Por favor ingrese un precio'),
  duration: z
      .string()
      .regex(/^\d+ días \/ \d+ noches$/, 'Formato inválido. Ejemplo: 5 días / 4 noches')
      .min(1, 'Por favor ingrese la duración'),
  included: z.string().min(10, 'Por favor detalle qué incluye el paquete'),
  notIncluded: z.string().min(10, 'Por favor detalle qué no incluye el paquete'),
  images: z
      .any()
      .refine((files) => files && files.length > 0, 'Debe subir al menos una imagen')
      .refine(
          (files) => Array.from(files).every((file) => file.type.startsWith('image/')),
          'Solo se permiten archivos de imagen'
      ),
});

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const agencyId = searchParams.get('agencyId');
    const featured = searchParams.get('featured') === 'true';
    const limit = parseInt(searchParams.get('limit') || '100');
    const destination = searchParams.get('destination');
    const category = searchParams.getAll('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const status = searchParams.get('status') ? [searchParams.get('status')] : ['Creado', 'Listado', 'Archivado'];
    const date = searchParams.get('date');
    const minDuration = searchParams.get('minDuration');
    const maxDuration = searchParams.get('maxDuration');
    const travelers = searchParams.get('travelers');

    // Build the query
    let query: any = {};

    if (agencyId) query.agencyId = new ObjectId(agencyId);
    query.status = { $in: status };
    if (destination) query.destination = { $regex: destination, $options: 'i' };
    if (category.length > 0) query.category = { $in: category };

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    if (date) query['startDates.date'] = { $gte: new Date(date) };

    if (minDuration || maxDuration) {
      query['duration.days'] = {};
      if (minDuration) query['duration.days'].$gte = parseInt(minDuration);
      if (maxDuration) query['duration.days'].$lte = parseInt(maxDuration);
    }

    if (travelers) {
      const travelersCount = parseInt(travelers);
      query.minPeople = { $lte: travelersCount };
      query.maxPeople = { $gte: travelersCount };
    }

    // If featured is true, get packages from verified agencies with most views
    if (featured) {
      // Get verified agencies
      const verifiedAgencies = await Agency.find({ verified: true }).select('_id');
      const verifiedAgencyIds = verifiedAgencies.map(agency => agency._id);

      // Only include packages from verified agencies
      query.agencyId = { $in: verifiedAgencyIds };

      // Get package view statistics
      const packageStats = await Statistic.aggregate([
        { $match: { type: 'view', agencyId: { $in: verifiedAgencyIds } } },
        { $group: { _id: '$packageId', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: limit }
      ]);

      // Get the package IDs with most views
      const topPackageIds = packageStats
          .filter(stat => stat._id) // Filter out null packageIds
          .map(stat => stat._id);

      // If we have top packages, filter by them
      if (topPackageIds.length > 0) {
        query._id = { $in: topPackageIds };

        // Get the packages
        const packages = await Package.aggregate([
          { $match: query },
          {
            $lookup: {
              from: 'agencies',
              localField: 'agencyId',
              foreignField: '_id',
              as: 'agency'
            }
          },
          { $unwind: '$agency' },
          {
            $lookup: {
              from: 'reviews', // Assuming reviews collection is named 'reviews'
              localField: '_id', // Reference to the package _id
              foreignField: 'packageId', // Foreign field that references the package
              as: 'reviews'
            }
          },
          {
            $addFields: {
              reviewCount: { $size: '$reviews' }, // Count the number of reviews
              rating: {
                $avg: '$reviews.rating' // Calculate the average rating
              },
              subscriptionPriority: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$agency.subscriptionPlan', 'premium'] }, then: 3 },
                    { case: { $eq: ['$agency.subscriptionPlan', 'basic'] }, then: 2 },
                    { case: { $eq: ['$agency.subscriptionPlan', 'free'] }, then: 1 }
                  ],
                  default: 0
                }
              },
              verifiedPriority: { $cond: { if: '$agency.verified', then: 1, else: 0 } }
            }
          },
          {
            $sort: {
              verifiedPriority: -1,
              subscriptionPriority: -1,
              rating: -1, // Sort by rating
              reviewCount: -1, // Sort by review count
              createdAt: -1
            }
          },
          { $limit: limit }
        ]);

        return NextResponse.json(packages);
      }
    }

    const packages = await Package.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'agencies',
          localField: 'agencyId',
          foreignField: '_id',
          as: 'agency'
        }
      },
      { $unwind: '$agency' },
      {
        $lookup: {
          from: 'reviews', // Assuming reviews collection is named 'reviews'
          localField: '_id', // Reference to the package _id
          foreignField: 'packageId', // Foreign field that references the package
          as: 'reviews'
        }
      },
      {
        $addFields: {
          reviewCount: { $size: '$reviews' }, // Count the number of reviews
          rating: {
            $avg: '$reviews.rating' // Calculate the average rating
          },
          subscriptionPriority: {
            $switch: {
              branches: [
                { case: { $eq: ['$agency.subscriptionPlan', 'premium'] }, then: 3 },
                { case: { $eq: ['$agency.subscriptionPlan', 'basic'] }, then: 2 },
                { case: { $eq: ['$agency.subscriptionPlan', 'free'] }, then: 1 }
              ],
              default: 0
            }
          },
          verifiedPriority: { $cond: { if: '$agency.verified', then: 1, else: 0 } }
        }
      },
      {
        $sort: {
          verifiedPriority: -1,
          subscriptionPriority: -1,
          rating: -1, // Sort by rating
          reviewCount: -1, // Sort by review count
          createdAt: -1
        }
      },
      { $limit: limit }
    ]);


    return NextResponse.json(packages);
  } catch (error) {
    console.error('Error fetching packages:', error);
    return NextResponse.json(
        { error: 'Error fetching packages' },
        { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await dbConnect();

    // Parse FormData (multipart/form-data)
    const formData = await request.formData();
    const files = formData.getAll('images'); // Extract images

    // Upload images to Cloudinary
    const uploadedImages = await Promise.all(
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
        // Si no es un JSON, intentar parsear el formato "X días / Y noches"
        const durationMatch = durationStr.toString().match(/(\d+) días \/ (\d+) noches/);
        if (durationMatch) {
          duration = {
            days: parseInt(durationMatch[1]),
            nights: parseInt(durationMatch[2])
          };
        } else {
          console.error('Error al parsear la duración:', e);
        }
      }
    }

    // Store the package in MongoDB with Cloudinary URLs
    const packageData = {
      title: formData.get('title'),
      description: formData.get('description'),
      destination: formData.get('destination'),
      price: parseFloat(formData.get('price')),
      discountPercentage: parseFloat(formData.get('discountPercentage') || '0'),
      agencyId: session.user.id,
      minPeople: parseInt(formData.get('minPeople') || '1'),
      maxPeople: parseInt(formData.get('maxPeople')),
      duration: duration,
      included: formData.get('included').split('\n').map((item) => item.trim()).filter(item => item),
      notIncluded: formData.get('notIncluded').split('\n').map((item) => item.trim()).filter(item => item),
      images: uploadedImages,
      startDates: startDates,
      itinerary: itinerary,
      category: category,
    };

    const newPackage = await Package.create(packageData);

    return NextResponse.json(newPackage);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Error al crear el paquete' }, { status: 500 });
  }
}