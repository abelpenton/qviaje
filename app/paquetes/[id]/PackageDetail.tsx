// @ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Users, MapPin, Star, Clock, Download, Building2, Phone, Mail, Globe, ChevronRight } from 'lucide-react';
import ItineraryPDF from '@/app/paquetes/[id]/PdfItinerary'
import { pdf } from "@react-pdf/renderer";
import Link from 'next/link';
import FavoriteButton from './FavoriteButton';
import {useSession} from 'next-auth/react'
import ReviewsList from './ReviewList';
import ReviewForm from './ReviewForm';

export default function PackageDetail({ packageData, similarPackages = [] }) {
    const [selectedDate, setSelectedDate] = useState(
        packageData.startDates && packageData.startDates.length > 0
            ? packageData.startDates[0]
            : { date: new Date(), availableSpots: 0, price: packageData.price }
    );
    const [mainImage, setMainImage] = useState(
        packageData.images && packageData.images.length > 0
            ? packageData.images[0]
            : ""
    );
    const [travelers, setTravelers] = useState(packageData.minPeople || 1);
    const { data: session, status } = useSession();

    // Reviews state
    const [reviews, setReviews] = useState([]);
    const [loadingReviews, setLoadingReviews] = useState(true);

    useEffect(() => {
        // Fetch reviews when component mounts
        fetchReviews();

        // Track view
        trackView();
    }, []);

    const fetchReviews = async () => {
        try {
            setLoadingReviews(true);
            const response = await fetch(`/api/reviews?packageId=${packageData.id}`);

            if (!response.ok) {
                throw new Error('Error al cargar reseñas');
            }

            const data = await response.json();
            setReviews(data);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoadingReviews(false);
        }
    };

    const trackView = async () => {
        try {
            await fetch(`/api/statistics/track`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    packageId: packageData.id,
                    agencyId: packageData.agency.id,
                    type: 'view'
                }),
                cache: 'no-store'
            });
        } catch (error) {
            console.error('Error al registrar vista:', error);
        }
    };

    const handleDownloadPDF = async () => {
        // Use actual package data for the PDF
        const tourPackage = {
            title: packageData.title,
            subtitle: packageData.subtitle || packageData.description.substring(0, 100) + "...",
            location: packageData.location || packageData.destination,
            images: packageData.images.map(img => img.url || img),
            price: packageData.price,
            rating: packageData.rating || (packageData.agency?.rating),
            reviews: packageData.reviews?.length || (packageData.agency?.reviews || 0),
            dates: packageData.dates || `${packageData.duration.days} días / ${packageData.duration.nights} noches`,
            difficulty: "Moderado", // Valor por defecto
            minPeople: packageData.minPeople,
            maxPeople: packageData.maxPeople,
            startDates: packageData.startDates || [],
            included: packageData.included || [],
            notIncluded: packageData.notIncluded || [],
            itinerary: packageData.itinerary || [],
        };

        const blob = await pdf(<ItineraryPDF tourPackage={tourPackage} />).toBlob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `itinerario-${tourPackage.title.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // Format date for display
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch (error) {
            return "Fecha no disponible";
        }
    };

    // Generate WhatsApp link with package details
    const generateWhatsAppLink = async () => {
        if (!packageData.agency?.phone) return '#';

        // Track inquiry
        await handleInquiry();

        // Clean phone number (remove spaces, dashes, etc.)
        const cleanPhone = packageData.agency.phone.replace(/\D/g, '');

        // Create message with package details
        let message = `Hola, estoy interesado en el paquete turístico "${packageData.title}" para ${travelers} ${travelers === 1 ? 'persona' : 'personas'}`;

        // Add selected date if available
        if (selectedDate && selectedDate.date) {
            message += ` con salida el ${formatDate(selectedDate.date)}`;
        }

        // Add price information
        const pricePerPerson = selectedDate.price || packageData.price;
        const totalPrice = pricePerPerson * travelers;
        message += `.\n\nPrecio por persona: $${pricePerPerson} USD`;
        message += `\nPrecio total: $${totalPrice} USD`;

        // Add more package details
        message += `\n\nDestino: ${packageData.location || packageData.destination}`;
        message += `\nDuración: ${packageData.dates || `${packageData.duration.days} días / ${packageData.duration.nights} noches`}`;

        // Request more information
        message += `\n\n¿Podrían proporcionarme más información sobre este paquete? Gracias.`;

        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    };

    // Track inquiry when clicking on WhatsApp button
    const handleInquiry = async () => {
        try {
            await fetch('/api/statistics/track', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    packageId: packageData.id,
                    agencyId: packageData.agency.id,
                    type: 'inquiry'
                })
            });
        } catch (error) {
            console.error('Error al registrar consulta:', error);
        }
    };

    // Calculate total price
    const calculateTotalPrice = () => {
        const pricePerPerson = selectedDate.price || packageData.price;
        return pricePerPerson * travelers;
    };

    // Handle new review added
    const handleReviewAdded = (newReview) => {
        setReviews(prevReviews => [newReview, ...prevReviews]);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-[60vh] bg-black">
                {packageData.images && packageData.images.length > 0 && (
                    <Image
                        src={mainImage.url || mainImage}
                        alt={packageData.title}
                        fill
                        className="object-cover opacity-70"
                    />
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
                    <div className="container mx-auto">
                        <h1 className="text-4xl font-bold text-white mb-2">{packageData.title}</h1>
                        <p className="text-xl text-white/90 mb-4">
                            {packageData.subtitle || packageData.description.substring(0, 100) + "..."}
                        </p>
                        <div className="flex items-center gap-4 text-white/90">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5"/>
                                {packageData.location || packageData.destination}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5"/>
                                {packageData.dates || `${packageData.duration.days} días / ${packageData.duration.nights} noches`}
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400"/>
                                <span>{packageData.rating || (packageData.agency?.rating)}</span>
                                <span>({packageData.reviews?.length || (packageData.agency?.reviews || 0)} reseñas)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thumbnail Images */}
            <div className="container mx-auto -mt-16 px-4 mb-8">
                <div className="grid grid-cols-4 gap-4">
                    {packageData.images && packageData.images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setMainImage(image)}
                            className="relative aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg hover:opacity-90 transition-opacity"
                        >
                            <Image
                                src={image.url || image}
                                alt={`Vista ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList>
                                <TabsTrigger value="overview">Descripción General</TabsTrigger>
                                <TabsTrigger value="itinerary">Itinerario</TabsTrigger>
                                <TabsTrigger value="included">Incluye/No Incluye</TabsTrigger>
                                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-6">
                                <Card className="p-6">
                                    <h2 className="text-2xl font-semibold mb-4">Detalles del Tour</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <Clock className="h-6 w-6 mx-auto mb-2 text-primary"/>
                                            <p className="text-sm text-muted-foreground">Duración</p>
                                            <p className="font-medium">
                                                {packageData.dates || `${packageData.duration.days} días / ${packageData.duration.nights} noches`}
                                            </p>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <Users className="h-6 w-6 mx-auto mb-2 text-primary"/>
                                            <p className="text-sm text-muted-foreground">Grupo</p>
                                            <p className="font-medium">{packageData.minPeople}-{packageData.maxPeople} personas</p>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <MapPin className="h-6 w-6 mx-auto mb-2 text-primary"/>
                                            <p className="text-sm text-muted-foreground">Destino</p>
                                            <p className="font-medium">{packageData.location}</p>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <Calendar className="h-6 w-6 mx-auto mb-2 text-primary"/>
                                            <p className="text-sm text-muted-foreground">Próxima Salida</p>
                                            <p className="font-medium">
                                                {packageData.startDates && packageData.startDates.length > 0
                                                    ? formatDate(packageData.startDates[0].date)
                                                    : "Consultar"}
                                            </p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Agency Info */}
                                {packageData.agency && (
                                    <Card className="p-6">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="relative h-16 w-16 rounded-full overflow-hidden">
                                                {packageData.agency.logo && (
                                                    <Image
                                                        src={packageData.agency.logo}
                                                        alt={packageData.agency.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-semibold">{packageData.agency.name}</h3>
                                                    {packageData.agency.verified && (
                                                        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                                                            Verificado
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                                                    <span>{packageData.agency.rating}</span>
                                                    <span>({packageData.agency.reviews} reseñas)</span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-muted-foreground mb-4">{packageData.agency.description}</p>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="flex items-center gap-2 text-sm">
                                                <MapPin className="h-4 w-4 text-muted-foreground"/>
                                                <span>{packageData.agency.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Phone className="h-4 w-4 text-muted-foreground"/>
                                                <span>{packageData.agency.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Mail className="h-4 w-4 text-muted-foreground"/>
                                                <span>{packageData.agency.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm">
                                                <Globe className="h-4 w-4 text-muted-foreground"/>
                                                <span>{packageData.agency.website}</span>
                                            </div>
                                        </div>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="itinerary" className="space-y-6">
                                {packageData.itinerary && packageData.itinerary.length > 0 ? (
                                    packageData.itinerary.map((day) => (
                                        <Card key={day.day} className="p-6">
                                            <h3 className="text-xl font-semibold mb-2">
                                                Día {day.day}: {day.title}
                                            </h3>
                                            <p className="text-muted-foreground mb-4">{day.description}</p>
                                            <div className="space-y-4">
                                                {day.activities && day.activities.map((activity, index) => (
                                                    <div key={index} className="flex items-start gap-4">
                                                        <div className="bg-primary/10 text-primary rounded-full p-2">
                                                            <Clock className="h-4 w-4"/>
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{activity.time}</p>
                                                            <p className="text-muted-foreground">{activity.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                                {day.meals && (
                                                    <div className="mt-4 pt-4 border-t">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div>
                                                                <p className="font-medium mb-2">Comidas incluidas:</p>
                                                                <div className="space-y-1">
                                                                    {day.meals.breakfast && <p>✓ Desayuno</p>}
                                                                    {day.meals.lunch && <p>✓ Almuerzo</p>}
                                                                    {day.meals.dinner && <p>✓ Cena</p>}
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <p className="font-medium mb-2">Alojamiento:</p>
                                                                <p>{day.accommodation}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Card>
                                    ))
                                ) : (
                                    <Card className="p-6">
                                        <p className="text-center text-muted-foreground">
                                            Itinerario detallado no disponible. Por favor contacte a la agencia para más información.
                                        </p>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="included" className="space-y-6">
                                <Card className="p-6">
                                    <h3 className="text-xl font-semibold mb-4">Incluye</h3>
                                    <ul className="space-y-2">
                                        {packageData.included && packageData.included.map((item, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-green-500"/>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                                <Card className="p-6">
                                    <h3 className="text-xl font-semibold mb-4">No Incluye</h3>
                                    <ul className="space-y-2">
                                        {packageData.notIncluded && packageData.notIncluded.map((item, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500"/>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </TabsContent>

                            <TabsContent value="reviews" className="space-y-6">
                                {/* Review Form */}
                                <ReviewForm
                                    packageId={packageData.id}
                                    onReviewAdded={handleReviewAdded}
                                />

                                {/* Reviews List */}
                                <ReviewsList
                                    packageId={packageData.id}
                                    initialReviews={reviews}
                                    loading={loadingReviews}
                                />
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-6 sticky top-24">
                            <div className="flex items-baseline justify-between mb-4">
                                <div className="text-3xl font-bold">
                                    USD ${selectedDate.price || packageData.price}
                                </div>
                                <div className="text-sm text-muted-foreground">por persona</div>
                            </div>

                            <div className="space-y-4 mb-6">
                                {packageData.startDates && packageData.startDates.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            Fecha de Salida
                                        </label>
                                        <select
                                            className="w-full border rounded-md p-2"
                                            value={selectedDate.date}
                                            onChange={(e) => {
                                                const selected = packageData.startDates.find(
                                                    (date) => date.date === e.target.value
                                                );
                                                if (selected) setSelectedDate(selected);
                                            }}
                                        >
                                            {packageData.startDates.map((date) => (
                                                <option key={date.date} value={date.date}>
                                                    {formatDate(date.date)} - {date.availableSpots}{" "}
                                                    lugares disponibles
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Número de Viajeros
                                    </label>
                                    <div className="flex items-center">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setTravelers(Math.max(packageData.minPeople || 1, travelers - 1))}
                                            disabled={travelers <= (packageData.minPeople || 1)}
                                        >
                                            -
                                        </Button>
                                        <span className="mx-4 font-medium">{travelers}</span>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setTravelers(Math.min(packageData.maxPeople || 10, travelers + 1))}
                                            disabled={travelers >= (packageData.maxPeople || 10)}
                                        >
                                            +
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 mb-6 border-t border-b py-4">
                                <div className="flex justify-between">
                                    <span>Precio base</span>
                                    <span>${selectedDate.price || packageData.price} USD</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Personas</span>
                                    <span>x {travelers}</span>
                                </div>
                                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
                                    <span>Total</span>
                                    <span>${calculateTotalPrice()} USD</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Button className="flex-1" onClick={generateWhatsAppLink}>
                                        <Phone className="h-4 w-4 mr-2"/>
                                        Consultar
                                    </Button>
                                    <FavoriteButton packageId={packageData.id} />
                                </div>
                                <Button variant="outline" className="w-full" onClick={handleDownloadPDF}>
                                    <Download className="h-4 w-4 mr-2"/>
                                    Descargar Itinerario
                                </Button>
                            </div>

                            <div className="mt-6 pt-6 border-t text-sm text-muted-foreground">
                                <p className="flex items-center gap-2 mb-2">
                                    <Calendar className="h-4 w-4"/>
                                    Reserva flexible - Cancela hasta 30 días antes
                                </p>
                                <p className="flex items-center gap-2">
                                    <Users className="h-4 w-4"/>
                                    Grupo pequeño - Máximo {packageData.maxPeople} personas
                                </p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Similar Packages Section */}
            {similarPackages && similarPackages.length > 0 && (
                <section className="bg-gray-50 py-12 mt-8">
                    <div className="container mx-auto px-4">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold">Paquetes Similares</h2>
                            <Link href="/paquetes" className="text-primary hover:underline inline-flex items-center">
                                Ver más paquetes
                                <ChevronRight className="ml-1 h-4 w-4"/>
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {similarPackages.map((pkg) => (
                                <Link key={pkg.id} href={`/paquetes/${pkg.id}`} className="group">
                                    <Card className="overflow-hidden h-full">
                                        <div className="relative aspect-[4/3]">
                                            <Image
                                                src={pkg.image || "https://via.placeholder.com/800x600?text=No+Image"}
                                                alt={pkg.title}
                                                fill
                                                className="object-cover transition-transform group-hover:scale-105"
                                            />
                                            <div className="absolute bottom-3 left-3 flex gap-2">
                                                {pkg.tags && pkg.tags.slice(0, 2).map((tag) => (
                                                    <span key={tag}
                                                          className="px-2 py-1 rounded-full text-xs font-medium bg-white/90">
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
                                            <p className="text-sm text-muted-foreground mb-2">{pkg.subtitle}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <MapPin className="h-4 w-4"/>
                                                <span>{pkg.location}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <Calendar className="h-4 w-4"/>
                                                <span>{pkg.dates}</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="font-semibold text-lg">
                                                    USD ${pkg.price.toLocaleString()}
                                                </p>
                                                <span className="text-sm text-muted-foreground">
                                                    {pkg.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </Card>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}