import {getServerSession} from 'next-auth'
import {authOptions} from '@/lib/auth'
import {NextResponse} from 'next/server'
import dbConnect from '@/lib/db'
import Package from '@/models/Package'

export async function PATCH(
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
        const { status } = await request.json();

        // Validar que el estado sea válido
        if (!['Creado', 'Listado', 'Archivado'].includes(status)) {
            return NextResponse.json(
                { error: 'Estado no válido' },
                { status: 400 }
            );
        }

        // Buscar el paquete y verificar que pertenezca a la agencia
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

        // Actualizar el estado
        packageToUpdate.status = status;
        await packageToUpdate.save();

        return NextResponse.json(packageToUpdate);
    } catch (error) {
        console.error('Error al actualizar el estado del paquete:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el estado del paquete' },
            { status: 500 }
        );
    }
}
