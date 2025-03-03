//@ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Star, Heart, Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function MisPaquetesPage() {
    const { data: session, status } = useSession();
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Redirect if not logged in or not a user
        if (status === 'unauthenticated' || (session?.user?.type !== 'user')) {
            router.push('/auth/login');
            return;
        }

        const fetchFavorites = async () => {
            if (!session?.user?.id) return;

            try {
                setLoading(true);
                const response = await fetch(`/api/users/${session.user.id}/favorites`);

                if (!response.ok) {
                    toast.error('Error al cargar paquetes favoritos');
                }

                const data = await response.json();
                setFavorites(data);
            } catch (error) {
                console.error('Error al cargar favoritos:', error);
                toast.error('Error al cargar tus paquetes favoritos');
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchFavorites();
        }
    }, [session, router, status]);

    const removeFavorite = async (packageId) => {
        try {
            const response = await fetch(`/api/users/${session.user.id}/favorites/${packageId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                toast.error('Error al eliminar de favoritos');
            }

            // Actualizar la lista de favoritos
            setFavorites(favorites.filter(pkg => pkg._id !== packageId));
            toast.success('Paquete eliminado de favoritos');
        } catch (error) {
            console.error('Error al eliminar favorito:', error);
            toast.error('Error al eliminar de favoritos');
        }
    };

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mis Paquetes Favoritos</h1>
                    <p className="text-muted-foreground">
                        Gestiona tus paquetes turísticos guardados
                    </p>
                </div>

                <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                        <TabsTrigger value="all">Todos</TabsTrigger>
                        <TabsTrigger value="upcoming">Próximos Viajes</TabsTrigger>
                        <TabsTrigger value="past">Historial</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-6">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <p>Cargando tus paquetes favoritos...</p>
                            </div>
                        ) : favorites.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {favorites.map((pkg) => (
                                    <Card key={pkg._id} className="overflow-hidden h-full group relative">
                                        <Link href={`/paquetes/${pkg._id}`} className="block">
                                            <div className="relative aspect-[4/3]">
                                                <Image
                                                    src={pkg.images[0]?.url || "https://via.placeholder.com/800x600?text=No+Image"}
                                                    alt={pkg.title}
                                                    fill
                                                    className="object-cover transition-transform group-hover:scale-105"
                                                />
                                                <div className="absolute bottom-3 left-3 flex gap-2">
                                                    {pkg.category && pkg.category.slice(0, 2).map((tag) => (
                                                        <span key={tag} className="px-2 py-1 rounded-full text-xs font-medium bg-white/90">
                              {tag}
                            </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="font-semibold text-lg">{pkg.title}</h3>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                                                        <span>{pkg.rating}</span>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground mb-2">{pkg.description.substring(0, 60)}...</p>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                    <MapPin className="h-4 w-4"/>
                                                    <span>{pkg.destination}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                    <Calendar className="h-4 w-4"/>
                                                    <span>{pkg.duration.days} días / {pkg.duration.nights} noches</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="font-semibold text-lg">
                                                        USD ${pkg.price.toLocaleString()}
                                                    </p>
                                                    <span className="text-sm text-muted-foreground">
                            {pkg.minPeople}-{pkg.maxPeople} personas
                          </span>
                                                </div>
                                            </div>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="absolute top-2 right-2 bg-white/80 hover:bg-white/90"
                                            onClick={() => removeFavorite(pkg._id)}
                                            title="Eliminar de favoritos"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 bg-gray-50 rounded-lg">
                                <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium mb-2">No tienes paquetes favoritos</h3>
                                <p className="text-muted-foreground mb-4">
                                    Explora paquetes turísticos y guárdalos como favoritos para verlos aquí
                                </p>
                                <Link href="/explorar">
                                    <Button>Explorar Paquetes</Button>
                                </Link>
                            </div>
                        )}
                    </TabsContent>

                    <TabsContent value="upcoming" className="mt-6">
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium mb-2">No tienes viajes programados</h3>
                            <p className="text-muted-foreground mb-4">
                                Aquí se mostrarán tus próximos viajes cuando reserves un paquete
                            </p>
                            <Link href="/explorar">
                                <Button>Explorar Paquetes</Button>
                            </Link>
                        </div>
                    </TabsContent>

                    <TabsContent value="past" className="mt-6">
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <h3 className="text-lg font-medium mb-2">No tienes historial de viajes</h3>
                            <p className="text-muted-foreground mb-4">
                                Aquí se mostrarán tus viajes pasados
                            </p>
                            <Link href="/explorar">
                                <Button>Explorar Paquetes</Button>
                            </Link>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}