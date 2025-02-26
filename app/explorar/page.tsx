"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin, Calendar, Users, Heart, Star, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from 'next/navigation';

const categories = [
  "Todos",
  "Playa",
  "Montaña",
  "Ciudad",
  "Aventura",
  "Relax",
  "Cultural",
  "Familiar",
  "Romántico",
  "Lujo",
  "Económico",
];

const destinations = [
  {
    id: 1,
    title: "Punta del Este",
    subtitle: "Escapada de lujo con playa privada",
    location: "Uruguay",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60",
    price: 1299,
    rating: 4.97,
    reviews: 128,
    dates: "5 días / 4 noches",
    tags: ["Playa", "Lujo"],
    minPrice: 1299,
    maxPrice: 1599,
    difficulty: "Fácil"
  },
  {
    id: 2,
    title: "Riviera Maya",
    subtitle: "Todo incluido en el Caribe",
    location: "México",
    image: "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&auto=format&fit=crop&q=60",
    price: 1599,
    rating: 4.89,
    reviews: 96,
    dates: "7 días / 6 noches",
    tags: ["Playa", "Todo Incluido"],
    minPrice: 1599,
    maxPrice: 1899,
    difficulty: "Fácil"
  },
  {
    id: 3,
    title: "Bariloche",
    subtitle: "Aventura en la Patagonia",
    location: "Argentina",
    image: "https://images.unsplash.com/photo-1626268220142-f4fb3775d6e4?w=800&auto=format&fit=crop&q=60",
    price: 899,
    rating: 4.92,
    reviews: 215,
    dates: "4 días / 3 noches",
    tags: ["Montaña", "Aventura"],
    minPrice: 899,
    maxPrice: 1299,
    difficulty: "Moderado"
  },
  {
    id: 4,
    title: "Punta Cana",
    subtitle: "Paraíso caribeño all-inclusive",
    location: "República Dominicana",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&auto=format&fit=crop&q=60",
    price: 1899,
    rating: 4.95,
    reviews: 312,
    dates: "7 días / 6 noches",
    tags: ["Playa", "Todo Incluido"],
    minPrice: 1899,
    maxPrice: 2299,
    difficulty: "Fácil"
  },
  {
    id: 5,
    title: "Río de Janeiro",
    subtitle: "Carnaval y playas",
    location: "Brasil",
    image: "https://images.unsplash.com/photo-1541436293327-8f104af135eb?w=800&auto=format&fit=crop&q=60",
    price: 1299,
    rating: 4.88,
    reviews: 164,
    dates: "6 días / 5 noches",
    tags: ["Ciudad", "Cultural"],
    minPrice: 1299,
    maxPrice: 1699,
    difficulty: "Fácil"
  },
  {
    id: 6,
    title: "Machu Picchu",
    subtitle: "Aventura Inca en los Andes",
    location: "Perú",
    image: "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&auto=format&fit=crop&q=60",
    price: 1499,
    rating: 4.96,
    reviews: 203,
    dates: "5 días / 4 noches",
    tags: ["Cultural", "Aventura"],
    minPrice: 1499,
    maxPrice: 1899,
    difficulty: "Moderado"
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 });
  const [selectedDifficulty, setSelectedDifficulty] = useState("Todos");

  // Filtrar destinos
  const filteredDestinations = destinations.filter(destination => {
    const matchesCategory = selectedCategory === "Todos" || destination.tags.includes(selectedCategory);
    const matchesSearch = destination.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         destination.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPrice = destination.price >= priceRange.min && destination.price <= priceRange.max;
    const matchesDifficulty = selectedDifficulty === "Todos" || destination.difficulty === selectedDifficulty;

    return matchesCategory && matchesSearch && matchesPrice && matchesDifficulty;
  });

  const handlePackageClick = (id: number) => {
    router.push(`/paquetes/${id}`);
  };

  return (
    <div className="min-h-screen">
      {/* Header Search Bar */}
      <div className="sticky top-0 z-50 bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="¿A dónde quieres ir?"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="rounded-full">
              <Calendar className="h-4 w-4 mr-2" />
              Fechas
            </Button>
            <Button variant="outline" className="rounded-full">
              <Users className="h-4 w-4 mr-2" />
              Viajeros
            </Button>
            <Button variant="outline" className="rounded-full">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex gap-8 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                className={`text-sm pb-4 border-b-2 transition-colors ${
                  selectedCategory === category
                    ? "text-foreground border-foreground"
                    : "text-muted-foreground border-transparent hover:text-foreground hover:border-foreground"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDestinations.map((destination) => (
            <div
              key={destination.id}
              className="group cursor-pointer"
              onClick={() => handlePackageClick(destination.id)}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                <Image
                  src={destination.image}
                  alt={destination.title}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <button className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
                  <Heart className="h-5 w-5 text-neutral-600" />
                </button>
                <div className="absolute bottom-3 left-3 flex gap-2">
                  {destination.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 rounded-full text-xs font-medium bg-white/90">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">{destination.title}</h3>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span>{destination.rating}</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{destination.location}</p>
                <p className="text-sm font-medium">{destination.subtitle}</p>
                <p className="text-sm text-muted-foreground">{destination.dates}</p>
                <p className="font-semibold text-lg">
                  USD ${destination.price.toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}