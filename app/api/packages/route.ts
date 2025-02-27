//@ts-nocheck

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Package from '@/models/Package';
import * as z from 'zod';
import {authOptions} from '@/lib/auth'
import cloudinary from 'cloudinary';

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

    const query = agencyId ? { agencyId } : {};
    const packages = await Package.find(query).sort({ createdAt: -1 });

    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json(
        { error: 'Error al obtener los paquetes' },
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

    // Store the package in MongoDB with Cloudinary URLs
    const packageData = {
      title: formData.get('title'),
      description: formData.get('description'),
      destination: formData.get('destination'),
      price: parseFloat(formData.get('price')),
      agencyId: session.user.id,
      minPeople: parseInt(formData.get('minPeople') || '1'),
      maxPeople: parseInt(formData.get('maxPeople')),
      duration: {
        days: parseInt(formData.get('duration').split(' ')[0]),
        nights: parseInt(formData.get('duration').split(' / ')[1].split(' ')[0]),
      },
      included: formData.get('included').split('\n').map((item) => item.trim()).filter(item => item),
      notIncluded: formData.get('notIncluded').split('\n').map((item) => item.trim()).filter(item => item),
      images: uploadedImages,
      startDates: startDates,
    };

    const newPackage = await Package.create(packageData);

    return NextResponse.json(newPackage);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: 'Error al crear el paquete' }, { status: 500 });
  }
}