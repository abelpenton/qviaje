"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Star, Globe, Phone, Mail, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Datos de ejemplo de agencias
const agencies = [
    {
        id: 1,
        name: "Perú Adventures",
        logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200",
        description: "Especialistas en turismo de aventura en Perú con más de 15 años de experiencia.",
        location: "Cusco, Perú",
        rating: 4.9,
        reviews: 450,
        verified: true,
        specialties: ["Aventura", "Cultural", "Trekking"],
        phone: "+51 984 123 456",
        email: "info@peruadventures.com",
        website: "www.peruadventures.com",
        totalPackages: 24,
        featuredReviews: [
            {
                id: 1,
                user: "María González",
                rating: 5,
                date: "2024-03-15",
                comment: "¡Excelente servicio! Los guías son muy profesionales y conocedores.",
            },
            {
                id: 2,
                user: "John Smith",
                rating: 4.8,
                date: "2024-03-10",
                comment: "Muy buena organización y atención al cliente.",
            }
        ]
    },
    {
        id: 2,
        name: "Caribbean Tours",
        logo: "https://images.unsplash.com/photo-1581609836630-9007630f7a7b?w=200",
        description: "Tu mejor opción para vacaciones en el Caribe. Especialistas en paquetes todo incluido.",
        location: "Punta Cana, República Dominicana",
        rating: 4.8,
        reviews: 325,
        verified: true,
        specialties: ["Playa", "Todo Incluido", "Lujo"],
        phone: "+1 809 555 0123",
        email: "info@caribbeantours.com",
        website: "www.caribbeantours.com",
        totalPackages: 18,
        featuredReviews: [
            {
                id: 1,
                user: "Carlos Ruiz",
                rating: 5,
                date: "2024-03-12",
                comment: "Increíbles vacaciones en Punta Cana. Todo perfectamente organizado.",
            }
        ]
    },
    {
        id: 3,
        name: "Patagonia Explorer",
        logo: "https://images.unsplash.com/photo-1581609914197-889d68da3b1f?w=200",
        description: "Descubre la magia de la Patagonia con expertos locales. Aventuras únicas en el fin del mundo.",
        location: "Bariloche, Argentina",
        rating: 4.95,
        reviews: 280,
        verified: true,
        specialties: ["Aventura", "Naturaleza", "Trekking"],
        phone: "+54 294 444 5555",
        email: "info@patagoniaexplorer.com",
        website: "www.patagoniaexplorer.com",
        totalPackages: 15,
        featuredReviews: [
            {
                id: 1,
                user: "Sophie Martin",
                rating: 5,
                date: "2024-03-08",
                comment: "Una experiencia inolvidable en la Patagonia. Guías excepcionales.",
            }
        ]
    }
];

export default function AgenciasPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialty, setSelectedSpecialty] = useState("Todos");

    const specialties = ["Todos", "Aventura", "Cultural", "Playa", "Trekking", "Todo Incluido", "Lujo", "Naturaleza"];

    // Filtrar agencias
    const filteredAgencies = agencies.filter(agency => {
        const matchesSearch = agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agency.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpecialty = selectedSpecialty === "Todos" || agency.specialties.includes(selectedSpecialty);

        return matchesSearch && matchesSpecialty;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold mb-2">Agencias de Viajes Verificadas</h1>
                    <p className="text-muted-foreground">
                        Encuentra las mejores agencias de viajes verificadas en Latinoamérica
                    </p>
                </div>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border-b sticky top-0 z-10">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar agencias..."
                                className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="border rounded-full px-4 py-2"
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                        >
                            {specialties.map(specialty => (
                                <option key={specialty} value={specialty}>
                                    {specialty}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="space-y-6">
                    {filteredAgencies.map((agency) => (
                        <Card key={agency.id} className="p-6">
                            <div className="flex items-start gap-6">
                                {/* Logo y Detalles Principales */}
                                <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                                    <Image
                                        src={agency.logo}
                                        alt={agency.name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-xl font-semibold">{agency.name}</h2>
                                        {agency.verified && (
                                            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                        Verificado
                      </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                                        <div className="flex items-center gap-1">
                                            <MapPin className="h-4 w-4" />
                                            {agency.location}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span>{agency.rating}</span>
                                            <span>({agency.reviews} reseñas)</span>
                                        </div>
                                    </div>
                                    <p className="text-muted-foreground mb-4">{agency.description}</p>

                                    {/* Especialidades */}
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        {agency.specialties.map((specialty) => (
                                            <span
                                                key={specialty}
                                                className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full"
                                            >
                        {specialty}
                      </span>
                                        ))}
                                    </div>

                                    {/* Información de Contacto */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                            <span>{agency.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Mail className="h-4 w-4 text-muted-foreground" />
                                            <span>{agency.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                            <span>{agency.website}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{agency.totalPackages} paquetes disponibles</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Botón Ver Paquetes */}
                                <Link href={`/agencias/${agency.id}/paquetes`}>
                                    <Button variant="outline" className="self-center">
                                        Ver Paquetes
                                        <ChevronRight className="h-4 w-4 ml-2" />
                                    </Button>
                                </Link>
                            </div>

                            {/* Reseñas Destacadas */}
                            <div className="mt-6 pt-6 border-t">
                                <h3 className="font-semibold mb-4">Reseñas Destacadas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {agency.featuredReviews.map((review) => (
                                        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{review.user}</span>
                                                <span className="text-sm text-muted-foreground">
                          {new Date(review.date).toLocaleDateString()}
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
                                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}