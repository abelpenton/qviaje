//@ts-nocheck
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Calendar, Star, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Datos de ejemplo de la agencia
const agencyData = {
    id: 1,
    name: "Perú Adventures",
    logo: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=200",
    description: "Especialistas en turismo de aventura en Perú con más de 15 años de experiencia.",
    location: "Cusco, Perú",
    rating: 4.9,
    reviews: 450,
    verified: true,
};

// Datos de ejemplo de paquetes
const packages = [
    {
        id: 1,
        title: "Machu Picchu Mágico",
        subtitle: "Aventura Inca en los Andes",
        location: "Cusco, Perú",
        image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800",
        price: 1499,
        rating: 4.96,
        reviews: 203,
        dates: "5 días / 4 noches",
        tags: ["Cultural", "Aventura"],
        difficulty: "Moderado"
    },
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
    }
];

export default function AgencyPackagesPage({ params }: { params: { id: string } }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedDifficulty, setSelectedDifficulty] = useState("Todos");

    const difficulties = ["Todos", "Fácil", "Moderado", "Difícil"];

    // Filtrar paquetes
    const filteredPackages = packages.filter(pkg => {
        const matchesSearch = pkg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = selectedDifficulty === "Todos" || pkg.difficulty === selectedDifficulty;

        return matchesSearch && matchesDifficulty;
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Agency Header */}
            <div className="bg-white border-b">
                <div className="container mx-auto px-4 py-8">
                    <div className="flex items-center gap-6">
                        <div className="relative h-20 w-20 rounded-lg overflow-hidden">
                            <Image
                                src={agencyData.logo}
                                alt={agencyData.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-3xl font-bold">{agencyData.name}</h1>
                                {agencyData.verified && (
                                    <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full">
                    Verificado
                  </span>
                                )}
                            </div>
                            <div className="flex items-center gap-4 text-muted-foreground mt-2">
                                <div className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {agencyData.location}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>{agencyData.rating}</span>
                                    <span>({agencyData.reviews} reseñas)</span>
                                </div>
                            </div>
                        </div>
                    </div>
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
                                placeholder="Buscar paquetes..."
                                className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="border rounded-full px-4 py-2"
                            value={selectedDifficulty}
                            onChange={(e) => setSelectedDifficulty(e.target.value)}
                        >
                            {difficulties.map(difficulty => (
                                <option key={difficulty} value={difficulty}>
                                    {difficulty}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Packages Grid */}
            <main className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPackages.map((pkg) => (
                        <Link key={pkg.id} href={`/paquetes/${pkg.id}`} className="group">
                            <Card className="overflow-hidden">
                                <div className="relative aspect-[4/3]">
                                    <Image
                                        src={pkg.image}
                                        alt={pkg.title}
                                        fill
                                        className="object-cover transition-transform group-hover:scale-105"
                                    />
                                    <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
                                        <Heart className="h-5 w-5 text-neutral-600" />
                                    </button>
                                    <div className="absolute bottom-3 left-3 flex gap-2">
                                        {pkg.tags.map((tag) => (
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
                                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                            <span>{pkg.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-muted-foreground mb-2">{pkg.subtitle}</p>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                        <Calendar className="h-4 w-4" />
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
            </main>
        </div>
    );
}