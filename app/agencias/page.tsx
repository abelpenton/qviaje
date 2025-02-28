//@ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Star, Globe, Phone, Mail, ChevronRight, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";

export default function AgenciasPage() {
    const [agencies, setAgencies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedSpecialties, setSelectedSpecialties] = useState([]);
    const [filtersOpen, setFiltersOpen] = useState(false);

    const specialties = [
        "Aventura", "Cultural", "Playa", "Trekking",
        "Todo Incluido", "Lujo", "Naturaleza", "Familiar",
        "Romántico", "Económico", "Montaña", "Ciudad"
    ];

    useEffect(() => {
        const fetchAgencies = async () => {
            try {
                setLoading(true);
                // Fetch verified agencies
                const response = await fetch('/api/agencies?verified=true');

                if (!response.ok) {
                    throw new Error('Error al cargar agencias');
                }

                const data = await response.json();
                setAgencies(data);
            } catch (error) {
                console.error('Error fetching agencies:', error);
                setAgencies([]);
            } finally {
                setLoading(false);
            }
        };

        fetchAgencies();
    }, []);

    // Filtrar agencias
    const filteredAgencies = agencies.filter(agency => {
        const matchesSearch = !searchQuery ||
            agency.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agency.location.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSpecialty = selectedSpecialties.length === 0 ||
            selectedSpecialties.some(specialty =>
                agency.specialties?.includes(specialty) ||
                agency.category?.includes(specialty)
            );

        return matchesSearch && matchesSpecialty;
    });

    const handleSpecialtyChange = (specialty) => {
        setSelectedSpecialties(prev => {
            if (prev.includes(specialty)) {
                return prev.filter(s => s !== specialty);
            } else {
                return [...prev, specialty];
            }
        });
    };

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedSpecialties([]);
    };

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
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-1 relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Buscar agencias por nombre o ubicación..."
                                className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-background"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <Card key={i} className="p-6">
                                <div className="flex items-start gap-6">
                                    <Skeleton className="h-24 w-24 rounded-lg" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-6 w-48" />
                                        <Skeleton className="h-4 w-64" />
                                        <Skeleton className="h-16 w-full" />
                                        <div className="flex gap-2">
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                            <Skeleton className="h-6 w-16 rounded-full" />
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-10 w-28" />
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <>
                        {filteredAgencies.length > 0 ? (
                            <div className="space-y-6">
                                {filteredAgencies.map((agency) => (
                                    <Card key={agency._id} className="p-6">
                                        <div className="flex flex-col md:flex-row items-start gap-6">
                                            {/* Logo y Detalles Principales */}
                                            <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                                                <Image
                                                    src={agency.logo || "https://via.placeholder.com/200?text=No+Logo"}
                                                    alt={agency.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h2 className="text-xl font-semibold">{agency.name}</h2>
                                                    {agency.verified && (
                                                        <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full flex items-center">
                                                            <CheckCircle className="h-3 w-3 mr-1" />
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
                                                        <span>{agency.rating || "4.5"}</span>
                                                        <span>({agency.reviews || "0"} reseñas)</span>
                                                    </div>
                                                </div>
                                                <p className="text-muted-foreground mb-4">{agency.description}</p>

                                                {/* Especialidades */}
                                                <div className="flex flex-wrap gap-2 mb-4">
                                                    {(agency.specialties || agency.category || ["General"]).map((specialty) => (
                                                        <span
                                                            key={specialty}
                                                            className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full"
                                                        >
                                                            {specialty}
                                                        </span>
                                                    ))}
                                                </div>

                                                {/* Información de Contacto */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    {agency.phone && (
                                                        <div className="flex items-center gap-2">
                                                            <Phone className="h-4 w-4 text-muted-foreground" />
                                                            <span>{agency.phone}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4 text-muted-foreground" />
                                                        <span>{agency.email}</span>
                                                    </div>
                                                    {agency.website && (
                                                        <div className="flex items-center gap-2">
                                                            <Globe className="h-4 w-4 text-muted-foreground" />
                                                            <a
                                                                href={agency.website.startsWith('http') ? agency.website : `https://${agency.website}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="hover:underline"
                                                            >
                                                                {agency.website}
                                                            </a>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-medium">{agency.totalPackages || "0"} paquetes disponibles</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Botón Ver Paquetes */}
                                            <div className="self-center mt-4 md:mt-0">
                                                <Link href={`/explorar?agencyId=${agency._id}`}>
                                                    <Button variant="outline">
                                                        Ver Paquetes
                                                        <ChevronRight className="h-4 w-4 ml-2" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>

                                        {/* Redes Sociales */}
                                        {agency.socialMedia && Object.values(agency.socialMedia).some(value => value) && (
                                            <div className="mt-6 pt-6 border-t">
                                                <h3 className="font-semibold mb-4">Redes Sociales</h3>
                                                <div className="flex flex-wrap gap-4">
                                                    {agency.socialMedia.facebook && (
                                                        <a
                                                            href={agency.socialMedia.facebook}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-600 hover:underline flex items-center"
                                                        >
                                                            Facebook
                                                            <ChevronRight className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    {agency.socialMedia.instagram && (
                                                        <a
                                                            href={agency.socialMedia.instagram}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-pink-600 hover:underline flex items-center"
                                                        >
                                                            Instagram
                                                            <ChevronRight className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                    {agency.socialMedia.twitter && (
                                                        <a
                                                            href={agency.socialMedia.twitter}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-blue-400 hover:underline flex items-center"
                                                        >
                                                            Twitter
                                                            <ChevronRight className="h-4 w-4" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <h3 className="text-lg font-medium mb-2">No se encontraron agencias</h3>
                                <p className="text-muted-foreground mb-4">
                                    No hay agencias que coincidan con los filtros seleccionados
                                </p>
                                <Button onClick={clearFilters}>Limpiar filtros</Button>
                            </div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}