//@ts-nocheck
"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    rating: z.number().min(1, 'Por favor seleccione una calificación').max(5),
    comment: z.string().min(10, 'El comentario debe tener al menos 10 caracteres'),
    images: z.any().optional(),
});

export default function ReviewForm({ packageId, onReviewAdded }) {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagesPreviews, setImagesPreviews] = useState([]);
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            rating: 0,
            comment: '',
        },
    });

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedImages(files);

        // Generate previews
        const previews = [];
        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                previews.push(reader.result);
                if (previews.length === files.length) {
                    setImagesPreviews(previews);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (status !== 'authenticated') {
            toast.error('Debes iniciar sesión para dejar una reseña');
            router.push('/auth/login');
            return;
        }

        if (session.user.type !== 'user') {
            toast.error('Solo los usuarios pueden dejar reseñas');
            return;
        }

        try {
            setIsLoading(true);

            const formData = new FormData();
            formData.append('packageId', packageId);
            formData.append('rating', values.rating.toString());
            formData.append('comment', values.comment);
            formData.append('userId', session.user.id);

            // Add images if any
            if (selectedImages.length > 0) {
                selectedImages.forEach(image => {
                    formData.append('images', image);
                });
            }

            const response = await fetch('/api/reviews', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.error || 'Error al publicar la reseña');
            }

            const newReview = await response.json();

            toast.success('Reseña publicada exitosamente');
            form.reset();
            setSelectedImages([]);
            setImagesPreviews([]);

            // Notify parent component about the new review
            if (onReviewAdded) {
                onReviewAdded(newReview);
            }
        } catch (error) {
            console.error('Error al publicar reseña:', error);
            toast.error(error.message || 'Error al publicar la reseña');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Deja tu reseña</h3>

            {status !== 'authenticated' ? (
                <div className="text-center py-4">
                    <p className="mb-4 text-muted-foreground">Debes iniciar sesión para dejar una reseña</p>
                    <Button onClick={() => router.push('/auth/login')}>Iniciar sesión</Button>
                </div>
            ) : session.user.type !== 'user' ? (
                <div className="text-center py-4">
                    <p className="text-muted-foreground">Las agencias no pueden publicar reseñas</p>
                </div>
            ) : (
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="rating"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Calificación</FormLabel>
                                    <FormControl>
                                        <div className="flex items-center space-x-1">
                                            {[1, 2, 3, 4, 5].map((rating) => (
                                                <button
                                                    key={rating}
                                                    type="button"
                                                    onClick={() => field.onChange(rating)}
                                                    onMouseEnter={() => setHoveredRating(rating)}
                                                    onMouseLeave={() => setHoveredRating(0)}
                                                    className="focus:outline-none"
                                                >
                                                    <Star
                                                        className={`h-8 w-8 ${
                                                            (hoveredRating ? rating <= hoveredRating : rating <= field.value)
                                                                ? "fill-yellow-400 text-yellow-400"
                                                                : "text-gray-300"
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="comment"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Comentario</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Comparte tu experiencia con este paquete turístico..."
                                            {...field}
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="images"
                            render={({ field: { onChange, ...field } }) => (
                                <FormItem>
                                    <FormLabel>Imágenes (opcional)</FormLabel>
                                    <FormControl>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={(e) => {
                                                onChange(e.target.files);
                                                handleImageChange(e);
                                            }}
                                            {...field}
                                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Image previews */}
                        {imagesPreviews.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {imagesPreviews.map((preview, index) => (
                                    <div key={index} className="relative h-20 w-20 rounded-md overflow-hidden">
                                        <Image
                                            src={preview}
                                            alt={`Vista previa ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Publicando...' : 'Publicar reseña'}
                        </Button>
                    </form>
                </Form>
            )}
        </Card>
    );
}