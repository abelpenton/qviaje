import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import dbConnect from '@/lib/db';
import Agency from '@/models/Agency';
import {Resend} from 'resend'
import User from '@/models/User'

const resend = new Resend(process.env.RESEND_API_KEY);
export async function POST(request: Request) {
    try {
        await dbConnect();

        // Handle form data for file uploads
        const formData = await request.formData();

        // Extract data from form
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const description = formData.get('description') as string;
        const location = formData.get('location') as string;
        const phone = formData.get('phone') as string;
        const website = formData.get('website') as string || '';
        const instagram = formData.get('instagram') as string || '';
        const facebook = formData.get('facebook') as string || '';

        // Validate required fields
        if (!name || !email || !password || !description || !location || !phone) {
            return NextResponse.json(
                { error: 'Todos los campos obligatorios deben ser completados' },
                { status: 400 }
            );
        }

        // Check if agency already exists
        const existingAgency = await Agency.findOne({ email });
        if (existingAgency) {
            return NextResponse.json(
                { error: 'Ya existe una agencia con este email' },
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

        // Handle logo upload
        const logoFile = formData.get('logo') as File;
        let logoUrl = '';

        if (logoFile) {
            // Alternatively, you could use a data URL for demo purposes
            const buffer = await logoFile.arrayBuffer();
            const base64 = Buffer.from(buffer).toString('base64');
            const mimeType = logoFile.type;
            logoUrl = `data:${mimeType};base64,${base64}`;
        }

        // Hash password
        const hashedPassword = await hash(password, 12);

        // Create new agency
        const agency = await Agency.create({
            name,
            email,
            password: hashedPassword,
            logo: logoUrl,
            description,
            location,
            phone,
            socialMedia: {
                website,
                instagram,
                facebook,
            },
            verified: false,
        });

        // Remove password from response
        const agencyResponse = {
            id: agency._id,
            name: agency.name,
            email: agency.email,
            logo: agency.logo,
            description: agency.description,
            location: agency.location,
            phone: agency.phone,
            website: agency.website,
            verified: agency.verified,
            instagram: agency.instagram,
            facebook: agency.facebook
        };

        await resend.emails.send({
            from: 'QViaje <soporte@qviaje.com>',
            to: email,
            bcc: '2235penton@gmail.com',
            subject: 'Bienvenido a QViaje',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #3b82f6;">¡Bienvenido a QViaje!</h2>
              <p>Hola,</p>
              <p>Es un placer darte la bienvenida a QViaje, donde encontrarás las mejores opciones para gestionar tu negocio de viajes.</p>
              
              <p>Quiero que sepas que no estás solo en este viaje. Mi nombre es <strong>Abel Penton</strong> y estaré aquí para ayudarte personalmente en lo que necesites.</p>
            
              <p>Desde ahora, tienes acceso a publicar paquetes de viaje con facilidad y seguridad, certificar tu empresa, analisis de datos y mucho mas.</p>
              
              <p>Si en cualquier momento necesitas ayuda, no dudes en escribirme. Estoy aquí para hacer que tu experiencia en QViaje sea excelente.</p>
            
              <p>¡Bienvenido nuevamente y que empiece la aventura! 🚀</p>
            
              <p>Saludos,<br>
              <strong>Abel Penton</strong><br>
              Tu asistente de viajes en QViaje</p>
            </div>
      `,
        });


        return NextResponse.json(agencyResponse, { status: 201 });
    } catch (error: any) {
        console.error('Error registering agency:', error);
        return NextResponse.json(
            { error: 'Error al registrar la agencia' },
            { status: 500 }
        );
    }
}