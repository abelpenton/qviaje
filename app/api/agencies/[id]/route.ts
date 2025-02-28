//@ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Agency from '@/models/Agency';
import { authOptions } from '@/lib/auth';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Obtener una agencia específica
export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await dbConnect();
        const { id } = params;

        const agency = await Agency.findById(id).select('-password');

        if (!agency) {
            return NextResponse.json(
                { error: 'Agencia no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json(agency);
    } catch (error) {
        console.error('Error al obtener la agencia:', error);
        return NextResponse.json(
            { error: 'Error al obtener la agencia' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar una agencia
export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.id !== params.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();
        const { id } = params;

        // Verificar que la agencia exista
        const agency = await Agency.findById(id);

        if (!agency) {
            return NextResponse.json(
                { error: 'Agencia no encontrada' },
                { status: 404 }
            );
        }

        // Parse FormData
        const formData = await request.formData();

        // Extraer los datos del formulario
        const updateData = {
            name: formData.get('name'),
            email: formData.get('email'),
            description: formData.get('description'),
            location: formData.get('location'),
            phone: formData.get('phone'),
            website: formData.get('website'),
        };

        // Procesar redes sociales
        const socialMediaStr = formData.get('socialMedia');
        if (socialMediaStr) {
            try {
                updateData.socialMedia = JSON.parse(socialMediaStr);
            } catch (e) {
                console.error('Error al parsear las redes sociales:', e);
            }
        }

        // Procesar logo si se proporciona
        const logoFile = formData.get('logo');
        if (logoFile && logoFile instanceof File) {
            const buffer = await logoFile.arrayBuffer();
            const base64Image = Buffer.from(buffer).toString('base64');
            const uploadResponse = await cloudinary.v2.uploader.upload(`data:image/jpeg;base64,${base64Image}`);
            updateData.logo = uploadResponse.secure_url;
        }

        // Actualizar la agencia
        const updatedAgency = await Agency.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        return NextResponse.json(updatedAgency);
    } catch (error) {
        console.error('Error al actualizar la agencia:', error);
        return NextResponse.json(
            { error: 'Error al actualizar la agencia' },
            { status: 500 }
        );
    }
}