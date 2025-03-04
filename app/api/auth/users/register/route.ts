import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Agency from '@/models/Agency'

export async function POST(request: Request) {
    try {
        await dbConnect();

        const formData = await request.formData();

        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const phone = formData.get('phone') as string;
        const photoFile = formData.get('photo') as File;

        if (!name || !email || !password || !phone) {
            return NextResponse.json(
                { error: 'Todos los campos obligatorios deben ser completados' },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'Ya existe un usuario con este email' },
                { status: 400 }
            );
        }

        const existingAgency = await Agency.findOne({ email });
        if (existingAgency) {
            return NextResponse.json(
                { error: 'Ya existe una agencia con este email' },
                { status: 400 }
            );
        }

        let photoUrl = '';
        if (photoFile) {
            const buffer = await photoFile.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = photoFile.type;
            photoUrl = `data:${mimeType};base64,${base64}`;
        }

        console.log(password)
        const hashedPassword = await hash(password, 12);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            photo: photoUrl,
            verified: false,
        });

        return NextResponse.json({ id: user._id, name: user.name, email: user.email, photo: user.photo }, { status: 201 });
    } catch (error) {
        console.error('Error registrando usuario:', error);
        return NextResponse.json({ error: 'Error al registrar usuario' }, { status: 500 });
    }
}
