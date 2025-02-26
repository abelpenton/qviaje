//@ts-nocheck
"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Calendar,
    Users,
    MapPin,
    Star,
    Clock,
    Download,
    Building2,
    Phone,
    Mail,
    Globe,
    ChevronRight,
} from 'lucide-react';
import ItineraryPDF from '@/app/paquetes/[id]/PdfItinerary'
import { pdf, BlobProvider } from "@react-pdf/renderer";
import Link from 'next/link'

export default function PackageDetailPage({ packageData }) {
    const [selectedDate, setSelectedDate] = useState(packageData.startDates[0]);
    const [mainImage, setMainImage] = useState(packageData.images[0]);

    const similarPackages = [
        {
            id: 2,
            title: "Valle Sagrado Completo",
            subtitle: "Explora los tesoros Incas",
            location: "Cusco, Perú",
            image: "https://images.unsplash.com/photo-1580889272861-dc2dbea5f94d?w=800",
            price: 899,
            rating: 4.88,
            reviews: 156,
            dates: "3 días / 2 noches",
            tags: ["Cultural", "Historia"],
            difficulty: "Fácil"
        },
        {
            id: 3,
            title: "Trekking Salkantay",
            subtitle: "Ruta alternativa a Machu Picchu",
            location: "Cusco, Perú",
            image: "https://images.unsplash.com/photo-1569321633336-ee5147a2f22d?w=800",
            price: 699,
            rating: 4.92,
            reviews: 178,
            dates: "4 días / 3 noches",
            tags: ["Aventura", "Trekking"],
            difficulty: "Difícil"
        },
        {
            id: 4,
            title: "Camino Inca Clásico",
            subtitle: "La ruta original a Machu Picchu",
            location: "Cusco, Perú",
            image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
            price: 1299,
            rating: 4.95,
            reviews: 210,
            dates: "4 días / 3 noches",
            tags: ["Aventura", "Cultural", "Trekking"],
            difficulty: "Moderado"
        }
    ];
    const handleDownloadPDF = async () => {
        const tourPackage = {
            id: 1,
            title: "Aventura en Machu Picchu",
            subtitle: "Descubre la magia de la ciudad perdida de los Incas",
            location: "Cusco, Perú",
            images: [
                "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
                "https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=800",
                "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=800",
            ],
            price: 1499,
            rating: 4.96,
            reviews: 128,
            dates: "5 días / 4 noches",
            difficulty: "Moderado",
            minPeople: 2,
            maxPeople: 12,
            startDates: [
                { date: "2024-05-15", spots: 8, price: 1499 },
                { date: "2024-06-01", spots: 12, price: 1599 },
                { date: "2024-06-15", spots: 6, price: 1499 },
            ],
            included: [
                "Alojamiento en hoteles 4 estrellas",
                "Desayuno diario",
                "Traslados aeropuerto-hotel-aeropuerto",
                "Guía turístico profesional",
                "Entradas a sitios arqueológicos",
            ],
            notIncluded: [
                "Vuelos internacionales",
                "Propinas",
                "Gastos personales",
                "Seguro de viaje",
            ],
            itinerary: [
                {
                    day: 1,
                    title: "Llegada a Cusco",
                    description: "Recepción en el aeropuerto y traslado al hotel. Tarde libre para aclimatación.",
                    activities: [
                        { time: "13:00", description: "Recogida en el aeropuerto" },
                        { time: "15:00", description: "Check-in en el hotel" },
                        { time: "16:00", description: "Charla de orientación" },
                    ],
                    meals: {
                        breakfast: false,
                        lunch: false,
                        dinner: true,
                    },
                    accommodation: "Hotel San Agustín Plaza",
                },
            ],
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="relative h-[60vh] bg-black">
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-8">
                    <div className="container mx-auto">
                        <h1 className="text-4xl font-bold text-white mb-2">{packageData.title}</h1>
                        <p className="text-xl text-white/90 mb-4">{packageData.subtitle}</p>
                        <div className="flex items-center gap-4 text-white/90">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5"/>
                                {packageData.location}
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5"/>
                                {packageData.dates}
                            </div>
                            <div className="flex items-center gap-2">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400"/>
                                <span>{packageData.rating}</span>
                                <span>({packageData.reviews.length} reseñas)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thumbnail Images */}
            <div className="container mx-auto -mt-16 px-4 mb-8">
                <div className="grid grid-cols-4 gap-4">
                    {packageData.images.map((image, index) => (
                        <button
                            key={index}
                            onClick={() => setMainImage(image)}
                            className="relative aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg hover:opacity-90 transition-opacity"
                        >
                            <Image
                                src={image}
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
                                            <p className="font-medium">{packageData.dates}</p>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <Users className="h-6 w-6 mx-auto mb-2 text-primary"/>
                                            <p className="text-sm text-muted-foreground">Grupo</p>
                                            <p className="font-medium">{packageData.minPeople}-{packageData.maxPeople} personas</p>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <Star className="h-6 w-6 mx-auto mb-2 text-primary"/>
                                            <p className="text-sm text-muted-foreground">Dificultad</p>
                                            <p className="font-medium">{packageData.difficulty}</p>
                                        </div>
                                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                                            <Calendar className="h-6 w-6 mx-auto mb-2 text-primary"/>
                                            <p className="text-sm text-muted-foreground">Próxima Salida</p>
                                            <p className="font-medium">{new Date(packageData.startDates[0].date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </Card>

                                {/* Agency Info */}
                                <Card className="p-6">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="relative h-16 w-16 rounded-full overflow-hidden">
                                            <Image
                                                src={packageData.agency.logo}
                                                alt={packageData.agency.name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-semibold">{packageData.agency.name}</h3>
                                                {packageData.agency.verified && (
                                                    <span
                                                        className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
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
                            </TabsContent>

                            <TabsContent value="itinerary" className="space-y-6">
                                {packageData.itinerary.map((day) => (
                                    <Card key={day.day} className="p-6">
                                        <h3 className="text-xl font-semibold mb-2">
                                            Día {day.day}: {day.title}
                                        </h3>
                                        <p className="text-muted-foreground mb-4">{day.description}</p>
                                        <div className="space-y-4">
                                            {day.activities.map((activity, index) => (
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
                                        </div>
                                    </Card>
                                ))}
                            </TabsContent>

                            <TabsContent value="included" className="space-y-6">
                                <Card className="p-6">
                                    <h3 className="text-xl font-semibold mb-4">Incluye</h3>
                                    <ul className="space-y-2">
                                        {packageData.included.map((item, index) => (
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
                                        {packageData.notIncluded.map((item, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500"/>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </TabsContent>

                            <TabsContent value="reviews" className="space-y-6">
                                <Card className="p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-semibold">Reseñas de la Agencia</h3>
                                            <div className="flex items-center gap-2">
                                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400"/>
                                                <span className="font-medium text-lg">{packageData.agency.rating}</span>
                                                <span className="text-muted-foreground">
                        ({packageData.agency.reviews} reseñas)
                    </span>
                                            </div>
                                        </div>
                                        <Button>Escribir Reseña</Button>
                                    </div>
                                    <div className="space-y-6">
                                        {packageData.reviews.map((review) => (
                                            <div key={review.id} className="border-b pb-6 last:border-0">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium">{review.user}</h4>
                                                    <span className="text-sm text-muted-foreground">
                            {new Date(review.date).toLocaleDateString()}
                        </span>
                                                </div>
                                                <div className="flex items-center gap-1 mb-2">
                                                    {Array.from({length: 5}).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`h-4 w-4 ${
                                                                i < Number(review.rating)
                                                                    ? "fill-yellow-400 text-yellow-400"
                                                                    : "text-gray-300"
                                                            }`}
                                                        />
                                                    ))}
                                                </div>
                                                <p className="text-muted-foreground mb-4">{review.comment}</p>
                                                {review.images && (
                                                    <div className="flex gap-2">
                                                        {review.images.map((image, index) => (
                                                            <div
                                                                key={index}
                                                                className="relative h-20 w-20 rounded-lg overflow-hidden"
                                                            >
                                                                <Image
                                                                    src={image}
                                                                    alt={`Imagen de reseña ${index + 1}`}
                                                                    fill
                                                                    className="object-cover"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <Card className="p-6 sticky top-24">
                            <div className="flex items-baseline justify-between mb-4">
                                <div className="text-3xl font-bold">USD ${selectedDate.price}</div>
                                <div className="text-sm text-muted-foreground">por persona</div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Fecha de Salida
                                    </label>
                                    <select
                                        className="w-full border rounded-md p-2"
                                        value={selectedDate.date}
                                        onChange={(e) =>
                                            setSelectedDate(
                                                packageData.startDates.find(
                                                    (date) => date.date === e.target.value
                                                )!
                                            )
                                        }
                                    >
                                        {packageData.startDates.map((date) => (
                                            <option key={date.date} value={date.date}>
                                                {new Date(date.date).toLocaleDateString()} - {date.spots}{" "}
                                                lugares disponibles
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Número de Viajeros
                                    </label>
                                    <select className="w-full border rounded-md p-2">
                                        {Array.from(
                                            {length: packageData.maxPeople - packageData.minPeople + 1},
                                            (_, i) => i + packageData.minPeople
                                        ).map((num) => (
                                            <option key={num} value={num}>
                                                {num} {num === 1 ? "persona" : "personas"}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Button className="w-full">Consutlar</Button>
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
            <section className="bg-gray-50 py-12 mt-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold">Paquetes Similares</h2>
                        <Link href="/explorar" className="text-primary hover:underline inline-flex items-center">
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
                                            src={pkg.image}
                                            alt={pkg.title}
                                            fill
                                            className="object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute bottom-3 left-3 flex gap-2">
                                            {pkg.tags.map((tag) => (
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
        </div>
    );
}