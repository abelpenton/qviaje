//@ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Favorite from '@/models/Favorite';
import Package from '@/models/Package';
import { authOptions } from '@/lib/auth';

// GET - Obtener los paquetes favoritos de un usuario
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

        // Verificar que el usuario exista
        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        // Obtener los favoritos del usuario
        const favorites = await Favorite.find({ userId: id });

        // Obtener los detalles de los paquetes
        const packageIds = favorites.map(fav => fav.packageId);
        const packages = await Package.find({
            _id: { $in: packageIds },
            status: 'Listado' // Solo incluir paquetes activos
        });

        return NextResponse.json(packages);
    } catch (error) {
        console.error('Error al obtener favoritos:', error);
        return NextResponse.json(
            { error: 'Error al obtener favoritos' },
            { status: 500 }
        );
    }
}

// POST - Agregar un paquete a favoritos
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
)
{
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

        // Obtener el ID del paquete del cuerpo de la solicitud
        const { packageId } = await request.json();

        if (!packageId) {
            return NextResponse.json(
                { error: 'ID del paquete requerido' },
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

        // Verificar si ya está en favoritos
        const existingFavorite = await Favorite.findOne({
            userId: id,
            packageId
        });

        if (existingFavorite) {
            return NextResponse.json(
                { error: 'El paquete ya está en favoritos' },
                { status: 400 }
            );
        }

        // Crear el favorito
        const favorite = await Favorite.create({
            userId: id,
            packageId,
            createdAt: new Date()
        });

        return NextResponse.json(favorite);
    } catch (error) {
        console.error('Error al agregar favorito:', error);
        return NextResponse.json(
            { error: 'Error al agregar favorito' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || session.user.id !== params.id) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        await dbConnect();
        const { id, packageId } = params;

        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        if (!packageId) {
            return NextResponse.json(
                { error: 'ID del paquete requerido' },
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

        await Favorite.findOneAndDelete({
            userId: id,
            packageId
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error al eliminar el paquete:', error);
        return NextResponse.json(
            { error: 'Error al eliminar el paquete' },
            { status: 500 }
        );
    }
}