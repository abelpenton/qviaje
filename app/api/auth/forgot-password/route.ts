import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Agency from '@/models/Agency';
import { Resend } from 'resend';
import crypto from 'crypto';

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Generate a reset token
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email es requerido' },
                { status: 400 }
            );
        }

        // Find the user or agency
        let recipient;
        let recipientType = 'user';

        recipient = await User.findOne({ email });

        if (!recipient) {
            recipientType = 'agency';
            recipient = await Agency.findOne({ email });
        }

        if (!recipient) {
            // For security reasons, we still return success even if the email doesn't exist
            return NextResponse.json({ success: true });
        }

        // Generate reset token and expiry
        const resetToken = generateResetToken();
        const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

        // Store the token in the database
        if (recipientType === 'user') {
            await User.findByIdAndUpdate(recipient._id, {
                resetToken,
                resetTokenExpiry
            });
        } else {
            await Agency.findByIdAndUpdate(recipient._id, {
                resetToken,
                resetTokenExpiry
            });
        }

        // Create reset URL
        const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}&type=${recipientType}`;

        // Send email with Resend
        const {data, error} = await resend.emails.send({
            from: 'QViaje <no-reply@qviaje.com>',
            to: email,
            subject: 'Recuperación de contraseña - QViaje',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #3b82f6;">Recuperación de contraseña</h2>
          <p>Hola,</p>
          <p>Has solicitado restablecer tu contraseña en QViaje. Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Restablecer contraseña
            </a>
          </p>
          <p>Este enlace expirará en 1 hora.</p>
          <p>Si no solicitaste restablecer tu contraseña, puedes ignorar este correo electrónico.</p>
          <p>Saludos,<br>El equipo de QViaje</p>
        </div>
      `,
        });

        console.log(data);
        console.log(error);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error en recuperación de contraseña:', error);
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}