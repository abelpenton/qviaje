//@ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function ReviewsList({ packageId, initialReviews = [], loading: initialLoading = true }) {
    const [reviews, setReviews] = useState(initialReviews);
    const [loading, setLoading] = useState(initialLoading);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/reviews?packageId=${packageId}`);

                if (!response.ok) {
                    throw new Error('Error al cargar reseñas');
                }

                const data = await response.json();
                setReviews(data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        if (packageId && initialReviews.length === 0) {
            fetchReviews();
        }
    }, [packageId, initialReviews]);

    // Format date for display
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return format(date, 'PPP', { locale: es });
        } catch (error) {
            return "Fecha no disponible";
        }
    };

    return (
        <Card className="p-6">
            <h3 className="text-xl font-semibold mb-6">Reseñas de viajeros</h3>

            {loading ? (
                <div className="text-center py-4">Cargando reseñas...</div>
            ) : reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review._id} className="border-b pb-6 last:border-0">
                            <div className="flex items-start gap-4">
                                <div className="relative h-10 w-10 rounded-full overflow-hidden">
                                    <Image
                                        src={review.userId.photo || "https://via.placeholder.com/40?text=U"}
                                        alt={review.userId.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="font-medium">{review.userId.name}</h4>
                                        <span className="text-sm text-muted-foreground">
                      {formatDate(review.createdAt)}
                    </span>
                                    </div>
                                    <div className="flex items-center gap-1 mb-2">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`h-4 w-4 ${
                                                    i < review.rating
                                                        ? "fill-yellow-400 text-yellow-400"
                                                        : "text-gray-300"
                                                }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-muted-foreground mb-4">{review.comment}</p>
                                    {review.images && review.images.length > 0 && (
                                        <div className="flex gap-2 overflow-x-auto pb-2">
                                            {review.images.map((image, index) => (
                                                <div
                                                    key={index}
                                                    className="relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden"
                                                >
                                                    <Image
                                                        src={image.url}
                                                        alt={image.alt || `Imagen de reseña ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-muted-foreground">
                        Aún no hay reseñas para este paquete. ¡Sé el primero en compartir tu experiencia!
                    </p>
                </div>
            )}
        </Card>
    );
}