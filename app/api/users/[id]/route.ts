//@ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { authOptions } from '@/lib/auth';
import cloudinary from 'cloudinary';

cloudinary.v2.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// GET - Obtener un usuario específico
export async function GET(
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

        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        return NextResponse.json(
            { error: 'Error al obtener el usuario' },
            { status: 500 }
        );
    }
}

// PUT - Actualizar un usuario
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

        // Verificar que el usuario exista
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Parse FormData
        const formData = await request.formData();

        // Extraer los datos del formulario
        const updateData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
        };

        // Procesar foto si se proporciona
        const photoFile = formData.get('photo');
        if (photoFile && photoFile instanceof File) {
            const buffer = await photoFile.arrayBuffer();
            const base64Image = Buffer.from(buffer).toString('base64');
            const uploadResponse = await cloudinary.v2.uploader.upload(`data:image/jpeg;base64,${base64Image}`);
            updateData.photo = uploadResponse.secure_url;
        }

        // Actualizar el usuario
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el usuario' },
            { status: 500 }
        );
    }
}