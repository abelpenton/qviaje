//@ts-nocheck

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Package from '@/models/Package';

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
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    await dbConnect();
    const data = await request.json();
    
    // Procesar los datos del paquete
    const packageData = {
      ...data,
      agencyId: session.user.id,
      duration: {
        days: parseInt(data.duration.split(' ')[0]),
        nights: parseInt(data.duration.split(' ')[0]) - 1,
      },
      included: data.included.split('\n').map((item: string) => item.trim()),
      notIncluded: data.notIncluded.split('\n').map((item: string) => item.trim()),
    };

    const newPackage = await Package.create(packageData);
    return NextResponse.json(newPackage);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al crear el paquete' },
      { status: 500 }
    );
  }
}