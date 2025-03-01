import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Agency from '@/models/Agency';
import { hash } from 'bcryptjs';

export async function POST(request: Request) {
    try {
        await dbConnect();

        const { token, password, type } = await request.json();

        if (!token || !password) {
            return NextResponse.json(
                { error: 'Token y contraseña son requeridos' },
                { status: 400 }
            );
        }

        // Find the user or agency with the valid token
        let recipient;
        const recipientType = type || 'user';

        if (recipientType === 'user') {
            recipient = await User.findOne({
                resetToken: token,
                resetTokenExpiry: { $gt: Date.now() }
            });
        } else {
            recipient = await Agency.findOne({
                resetToken: token,
                resetTokenExpiry: { $gt: Date.now() }
            });
        }

        if (!recipient) {
            return NextResponse.json(
                { error: 'Token inválido o expirado' },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await hash(password, 10);

        // Update the password and clear the reset token
        if (recipientType === 'user') {
            // For users, we might not have a password field yet
            // This is a placeholder for future implementation
            await User.findByIdAndUpdate(recipient._id, {
                // password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            });
        } else {
            await Agency.findByIdAndUpdate(recipient._id, {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error al restablecer contraseña:', error);
        return NextResponse.json(
            { error: 'Error al procesar la solicitud' },
            { status: 500 }
        );
    }
}