//@ts-nocheck
"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {Search, MapPin, Calendar as CalendarIcon, Users, Heart, Star, ArrowRight, MessageSquare} from 'lucide-react'
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import "swiper/css";
import "swiper/css/effect-fade";

export default function Home() {
  const [featuredPackages, setFeaturedPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDestination, setSearchDestination] = useState("");
  const [travelers, setTravelers] = useState(2);
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [travelersOpen, setTravelersOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchFeaturedPackages = async () => {
      try {
        setLoading(true);
        // Fetch the top 5 most visited packages from verified agencies
        const response = await fetch('/api/packages?featured=true&limit=5&status=Listado');

        if (!response.ok) {
          throw new Error('Error al cargar paquetes destacados');
        }

        const data = await response.json();
        setFeaturedPackages(data);
      } catch (error) {
        console.error('Error fetching featured packages:', error);
        // Fallback to empty array if there's an error
        setFeaturedPackages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPackages();
  }, []);

  const handleSearch = () => {
    // Build query parameters for the search
    const params = new URLSearchParams();

    if (searchDestination) {
      params.append('destination', searchDestination);
    }

    if (travelers && travelers > 0) {
      params.append('travelers', travelers.toString());
    }

    if (selectedDate) {
      params.append('date', selectedDate.toISOString());
    }

    // Navigate to the explore page with the search parameters
    router.push(`/explorar?${params.toString()}`);
  };

  return (
      <div className="min-h-screen text-center">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center text-center">
          <Image
              src="https://images.unsplash.com/photo-1526772662000-3f88f10405ff?w=1200&auto=format&fit=crop&q=80"
              alt="Destino paradisíaco"
              fill
              className="object-cover brightness-50"
          />
          <div className="container relative z-10 text-center text-white">
            <h1 className="text-5xl font-bold mb-6">Descubre tu próxima aventura</h1>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Encuentra los mejores paquetes turísticos de agencias verificadas en Latinoamérica
            </p>
            <div className="bg-white/10 backdrop-blur-md rounded-full p-2 max-w-4xl mx-auto">
              <div className="flex items-center gap-4 justify-center">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white"/>
                  <input
                      type="text"
                      placeholder="¿A dónde quieres ir?"
                      className="w-full pl-10 pr-4 py-3 rounded-full bg-white/10 text-white placeholder:text-white/70 border-0 focus:ring-2 focus:ring-white/50"
                      value={searchDestination}
                      onChange={(e) => setSearchDestination(e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          className="rounded-full border-white/30 text-black hover:bg-white hover:text-black transition-colors"
                      >
                        <CalendarIcon className="h-4 w-4 mr-2"/>
                        {selectedDate ? format(selectedDate, "dd MMM", {locale: es}) : "Fechas"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setCalendarOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="bg-white rounded-lg"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="relative">
                  <Popover open={travelersOpen} onOpenChange={setTravelersOpen}>
                    <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          className="rounded-full border-white/30 text-black hover:bg-white hover:text-black transition-colors"
                      >
                        <Users className="h-4 w-4 mr-2"/>
                        {travelers} {travelers === 1 ? 'Viajero' : 'Viajeros'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-4" align="center">
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Número de viajeros</h4>
                        <div className="flex items-center space-x-2">
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setTravelers(Math.max(1, travelers - 1))}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">{travelers}</span>
                          <Button
                              variant="outline"
                              size="icon"
                              onClick={() => setTravelers(travelers + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <Button
                            className="w-full mt-2"
                            size="sm"
                            onClick={() => setTravelersOpen(false)}
                        >
                          Aplicar
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
                <Button
                    className="rounded-full bg-white text-black hover:bg-white/90"
                    onClick={handleSearch}
                >
                  <Search className="h-4 w-4"/>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="flex items-center justify-center py-20 bg-gray-50 w-full">
          <div className="container text-center">
            <h2 className="text-3xl font-bold mb-12">¿Por qué elegir QViaje?</h2>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-primary"/>
                </div>
                <h3 className="text-xl font-semibold mb-2">Búsqueda Simplificada</h3>
                <p className="text-muted-foreground">
                  Encuentra y compara cientos de paquetes turísticos en un solo lugar
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-primary"/>
                </div>
                <h3 className="text-xl font-semibold mb-2">Agencias Verificadas</h3>
                <p className="text-muted-foreground">
                  Todas las agencias son verificadas para garantizar la mejor experiencia
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-primary"/>
                </div>
                <h3 className="text-xl font-semibold mb-2">Mejores Precios</h3>
                <p className="text-muted-foreground">
                  Accede a ofertas exclusivas y los mejores precios del mercado
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-primary"/>
                </div>
                <h3 className="text-xl font-semibold mb-2">Reseñas Verificadas</h3>
                <p className="text-muted-foreground">
                  Lee opiniones reales de viajeros que han disfrutado la experiencia
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Packages */}
        <section className="py-20 flex items-center justify-center w-full">
          <div className="container">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-bold">Paquetes Destacados</h2>
              <Link href="/explorar" className="text-primary hover:underline inline-flex items-center">
                Ver todos los paquetes
                <ArrowRight className="ml-2 h-4 w-4"/>
              </Link>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Cargando paquetes destacados...</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  {featuredPackages.length > 0 ? (
                      featuredPackages.map((pkg) => (
                          <Link key={pkg._id} href={`/paquetes/${pkg._id}`} className="group">
                            <div className="relative aspect-[4/3] rounded-xl overflow-hidden mb-4">
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
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-xl">{pkg.title}</h3>
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400"/>
                                  <span>{pkg.rating || 4.5}</span>
                                </div>
                              </div>
                              <p className="text-muted-foreground">{pkg.destination}</p>
                              <p className="font-medium">{pkg.description.substring(0, 60)}...</p>
                              <p className="text-sm text-muted-foreground">
                                {pkg.duration.days} días / {pkg.duration.nights} noches
                              </p>
                              <p className="font-semibold text-lg">
                                USD ${pkg.price.toLocaleString()}
                              </p>
                            </div>
                          </Link>
                      ))
                  ) : (
                      <div className="col-span-3 text-center py-12">
                        <p className="text-muted-foreground">No se encontraron paquetes destacados</p>
                      </div>
                  )}
                </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground flex items-center justify-center w-full">
          <div className="container flex flex-col items-center justify-center text-center">
            <h2 className="text-3xl font-bold mb-6">¿Eres una agencia de viajes?</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Únete a QViaje y llega a miles de viajeros potenciales. Digitaliza tu negocio y aumenta tus ventas.
            </p>
            <Link href="/auth/register">
              <Button variant="outline"
                      className="rounded-full border-white text-black hover:bg-white hover:text-gray-800">
                Registra tu agencia
              </Button>
            </Link>
          </div>
        </section>
      </div>
  );
}