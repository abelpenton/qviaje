//@ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FavoriteButton({ packageId }) {
    const { data: session, status } = useSession();
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Check if package is in favorites
        const checkFavorite = async () => {
            if (!session?.user?.id || status !== 'authenticated' || session.user.type !== 'user') {
                return;
            }

            try {
                const response = await fetch(`/api/users/${session.user.id}/favorites/${packageId}`);

                if (!response.ok) {
                    toast.error('Error al verificar favoritos');
                }

                const favorites = await response.json();
                const isInFavorites = favorites.some(pkg => pkg._id === packageId);
                setIsFavorite(isInFavorites);
            } catch (error) {
                console.error('Error checking favorites:', error);
            }
        };

        checkFavorite();
    }, [packageId, session, status]);

    const toggleFavorite = async () => {
        if (status !== 'authenticated') {
            toast.error('Debes iniciar sesión para guardar favoritos');
            router.push('/auth/login');
            return;
        }

        if (session.user.type !== 'user') {
            toast.error('Solo los usuarios pueden guardar favoritos');
            return;
        }

        try {
            setLoading(true);

            if (isFavorite) {
                // Remove from favorites
                const response = await fetch(`/api/users/${session.user.id}/favorites/${packageId}`, {
                    method: 'DELETE',
                });

                if (!response.ok) {
                    toast.error('Error al eliminar de favoritos');
                }

                setIsFavorite(false);
                toast.success('Eliminado de favoritos');
            } else {
                // Add to favorites
                const response = await fetch(`/api/users/${session.user.id}/favorites`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ packageId }),
                });

                if (!response.ok) {
                    toast.error('Error al agregar a favoritos');
                }

                setIsFavorite(true);
                toast.success('Agregado a favoritos');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            toast.error(error.message || 'Error al actualizar favoritos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={toggleFavorite}
            disabled={loading}
            className={isFavorite ? "text-red-500" : ""}
            title={isFavorite ? "Eliminar de favoritos" : "Agregar a favoritos"}
        >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
        </Button>
    );
}