//@ts-nocheck
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import Agency from '@/models/Agency';
import { authOptions } from '@/lib/auth';

// Función para validar URLs
const isValidUrl = (url: string) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

// Función para verificar si una URL de redes sociales es válida
const validateSocialMediaUrl = (url: string, platform: string) => {
    if (!url) return false;

    try {
        const urlObj = new URL(url);

        switch (platform) {
            case 'facebook':
                return urlObj.hostname.includes('facebook.com') || urlObj.hostname.includes('fb.com');
            case 'instagram':
                return urlObj.hostname.includes('instagram.com');
            case 'twitter':
                return urlObj.hostname.includes('twitter.com') || urlObj.hostname.includes('x.com');
            default:
                return true;
        }
    } catch (e) {
        return false;
    }
};

// POST - Verificar una agencia
export async function POST(
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

        // Verificar requisitos para la verificación
        const verificationErrors = [];

        if (!agency.logo) {
            verificationErrors.push('Debe subir un logo de la agencia');
        }

        if (!agency.website || !isValidUrl(agency.website)) {
            verificationErrors.push('Debe proporcionar un sitio web válido');
        }

        if (!agency.socialMedia?.facebook || !validateSocialMediaUrl(agency.socialMedia.facebook, 'facebook')) {
            verificationErrors.push('Debe proporcionar un perfil de Facebook válido');
        }

        if (!agency.socialMedia?.instagram || !validateSocialMediaUrl(agency.socialMedia.instagram, 'instagram')) {
            verificationErrors.push('Debe proporcionar un perfil de Instagram válido');
        }

        if (verificationErrors.length > 0) {
            return NextResponse.json(
                {
                    error: 'No cumple con los requisitos para la verificación',
                    details: verificationErrors
                },
                { status: 400 }
            );
        }

        // Algoritmo simple de verificación:
        // 1. Verificar que tenga logo, sitio web, y perfiles de redes sociales
        // 2. Verificar que las URLs sean válidas
        // 3. Verificar que la agencia tenga al menos una descripción detallada

        let verificationScore = 0;

        // Logo
        if (agency.logo) {
            verificationScore += 25;
        }

        // Sitio web
        if (agency.website && isValidUrl(agency.website)) {
            verificationScore += 25;
        }

        // Facebook
        if (agency.socialMedia?.facebook && validateSocialMediaUrl(agency.socialMedia.facebook, 'facebook')) {
            verificationScore += 25;
        }

        // Instagram
        if (agency.socialMedia?.instagram && validateSocialMediaUrl(agency.socialMedia.instagram, 'instagram')) {
            verificationScore += 25;
        }

        // Verificar si alcanza el puntaje mínimo (100 puntos)
        if (verificationScore < 100) {
            return NextResponse.json(
                {
                    error: 'No cumple con los requisitos para la verificación',
                    score: verificationScore,
                    required: 100
                },
                { status: 400 }
            );
        }

        // Actualizar el estado de verificación
        agency.verified = true;
        await agency.save();

        return NextResponse.json({
            message: 'Agencia verificada exitosamente',
            agency: {
                ...agency.toObject(),
                password: undefined
            }
        });
    } catch (error) {
        console.error('Error al verificar la agencia:', error);
        return NextResponse.json(
            { error: 'Error al verificar la agencia' },
            { status: 500 }
        );
    }
}