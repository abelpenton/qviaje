//@ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Package from '@/models/Package';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();
    // @ts-ignore
    const packagedb = await Package.findById(params.id);

    //@ts-ignore
    if (!packagedb) {
      return NextResponse.json(
        { error: 'Paquete no encontrado' },
        { status: 404 }
      );
    }

    //@ts-ignore
    return NextResponse.json(packagedb);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener el paquete' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await request.json();
    
    const packagedb = await Package.findOneAndUpdate(
      { _id: params.id, agencyId: session.user.id },
      data,
      { new: true, runValidators: true }
    );
    
    if (!packagedb) {
      return NextResponse.json(
        { error: 'Paquete no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(packagedb);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al actualizar el paquete' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();
    const packagedb = await Package.findOneAndDelete({
      _id: params.id,
      agencyId: session.user.id,
    });
    
    if (!packagedb) {
      return NextResponse.json(
        { error: 'Paquete no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ message: 'Paquete eliminado exitosamente' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al eliminar el paquete' },
      { status: 500 }
    );
  }
}