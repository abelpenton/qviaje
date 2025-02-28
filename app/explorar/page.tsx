//@ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Search, MapPin, Calendar as CalendarIcon, Users, Star, Filter, X, Building2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ExplorePage() {
  const searchParams = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [agencyInfo, setAgencyInfo] = useState(null);

  // Filter states
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [travelers, setTravelers] = useState(parseInt(searchParams.get('travelers') || '2'));
  const [selectedDate, setSelectedDate] = useState(null);
  const [duration, setDuration] = useState([1, 15]); // Days range
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOption, setSortOption] = useState('price-asc');
  const [activeFilters, setActiveFilters] = useState([]);
  const [agencyId, setAgencyId] = useState(searchParams.get('agencyId') || '');

  const categories = [
    'Playa', 'Montaña', 'Ciudad', 'Aventura', 'Relax',
    'Cultural', 'Familiar', 'Romántico', 'Lujo', 'Económico'
  ];

  useEffect(() => {
    // Set initial filters from URL params
    if (searchParams.get('destination')) {
      setDestination(searchParams.get('destination'));
      addActiveFilter('destination', searchParams.get('destination'));
    }

    if (searchParams.get('travelers')) {
      setTravelers(parseInt(searchParams.get('travelers')));
      addActiveFilter('travelers', searchParams.get('travelers'));
    }

    if (searchParams.get('category')) {
      const category = searchParams.get('category');
      setSelectedCategories([category]);
      addActiveFilter('category', category);
    }

    if (searchParams.get('minPrice') && searchParams.get('maxPrice')) {
      const min = parseInt(searchParams.get('minPrice'));
      const max = parseInt(searchParams.get('maxPrice'));
      setPriceRange([min, max]);
      addActiveFilter('price', `$${min} - $${max}`);
    }

    if (searchParams.get('date')) {
      const date = new Date(searchParams.get('date'));
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
        addActiveFilter('date', format(date, 'PPP', { locale: es }));
      }
    }

    if (searchParams.get('minDuration') && searchParams.get('maxDuration')) {
      const min = parseInt(searchParams.get('minDuration'));
      const max = parseInt(searchParams.get('maxDuration'));
      setDuration([min, max]);
      addActiveFilter('duration', `${min} - ${max} días`);
    }

    if (searchParams.get('agencyId')) {
      setAgencyId(searchParams.get('agencyId'));
      fetchAgencyInfo(searchParams.get('agencyId'));
    }

    // Fetch packages with initial filters
    fetchPackages();
  }, [searchParams]);

  const fetchAgencyInfo = async (id) => {
    try {
      const response = await fetch(`/api/agencies/${id}`);
      if (response.ok) {
        const data = await response.json();
        setAgencyInfo(data);
        addActiveFilter('agency', data.name);
      }
    } catch (error) {
      console.error('Error fetching agency info:', error);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams();

      if (destination) {
        params.append('destination', destination);
      }

      if (selectedCategories.length > 0) {
        selectedCategories.forEach(category => {
          params.append('category', category);
        });
      }

      if (priceRange[0] > 0) {
        params.append('minPrice', priceRange[0].toString());
      }

      if (priceRange[1] < 5000) {
        params.append('maxPrice', priceRange[1].toString());
      }

      if (selectedDate) {
        params.append('date', selectedDate.toISOString());
      }

      if (duration[0] > 1) {
        params.append('minDuration', duration[0].toString());
      }

      if (duration[1] < 15) {
        params.append('maxDuration', duration[1].toString());
      }

      if (travelers > 1) {
        params.append('travelers', travelers.toString());
      }

      // Add agencyId filter if present
      if (agencyId) {
        params.append('agencyId', agencyId);
      }

      // Only include listed packages
      params.append('status', 'Listado');

      const response = await fetch(`/api/packages?status=Listado&${params.toString()}`);

      if (!response.ok) {
        throw new Error('Error al cargar paquetes');
      }

      let data = await response.json();

      // Apply client-side sorting
      data = sortPackages(data, sortOption);

      setPackages(data);
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortPackages = (packages, sortOption) => {
    switch (sortOption) {
      case 'price-asc':
        return [...packages].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...packages].sort((a, b) => b.price - a.price);
      case 'duration-asc':
        return [...packages].sort((a, b) => a.duration.days - b.duration.days);
      case 'duration-desc':
        return [...packages].sort((a, b) => b.duration.days - a.duration.days);
      default:
        return packages;
    }
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        const newCategories = prev.filter(c => c !== category);
        removeActiveFilter('category', category);
        return newCategories;
      } else {
        addActiveFilter('category', category);
        return [...prev, category];
      }
    });
  };

  const addActiveFilter = (type, value) => {
    setActiveFilters(prev => {
      // Remove existing filters of the same type if it's not a category
      const filtered = type === 'category'
          ? prev
          : prev.filter(filter => filter.type !== type);

      return [...filtered, { type, value }];
    });
  };

  const removeActiveFilter = (type, value) => {
    setActiveFilters(prev => {
      if (type === 'category') {
        return prev.filter(filter => !(filter.type === type && filter.value === value));
      } else if (type === 'agency') {
        setAgencyId('');
        return prev.filter(filter => filter.type !== type);
      } else {
        return prev.filter(filter => filter.type !== type);
      }
    });
  };

  const clearAllFilters = () => {
    setDestination('');
    setPriceRange([0, 5000]);
    setSelectedCategories([]);
    setTravelers(2);
    setSelectedDate(null);
    setDuration([1, 15]);
    setAgencyId('');
    setAgencyInfo(null);
    setActiveFilters([]);
  };

  const handleApplyFilters = () => {
    // Update active filters
    if (destination) {
      addActiveFilter('destination', destination);
    } else {
      removeActiveFilter('destination');
    }

    if (priceRange[0] > 0 || priceRange[1] < 5000) {
      addActiveFilter('price', `$${priceRange[0]} - $${priceRange[1]}`);
    } else {
      removeActiveFilter('price');
    }

    if (travelers > 1) {
      addActiveFilter('travelers', travelers.toString());
    } else {
      removeActiveFilter('travelers');
    }

    if (selectedDate) {
      addActiveFilter('date', format(selectedDate, 'PPP', { locale: es }));
    } else {
      removeActiveFilter('date');
    }

    if (duration[0] > 1 || duration[1] < 15) {
      addActiveFilter('duration', `${duration[0]} - ${duration[1]} días`);
    } else {
      removeActiveFilter('duration');
    }

    fetchPackages();
    setMobileFiltersOpen(false);
  };

  const handleSortChange = (e) => {
    const option = e.target.value;
    setSortOption(option);
    setPackages(sortPackages([...packages], option));
  };

  return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-4">
          {agencyInfo
              ? `Paquetes de ${agencyInfo.name}`
              : "Explora Paquetes Turísticos"}
        </h1>

        {agencyInfo && (
            <div className="mb-6 p-4 bg-muted rounded-lg flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-full overflow-hidden">
                <Image
                    src={agencyInfo.logo || "https://via.placeholder.com/200?text=No+Logo"}
                    alt={agencyInfo.name}
                    fill
                    className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">{agencyInfo.name}</h2>
                  {agencyInfo.verified && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Verificada
                      </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{agencyInfo.location}</p>
              </div>
            </div>
        )}

        {/* Active filters */}
        {activeFilters.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-muted-foreground">Filtros activos:</span>
                {activeFilters.map((filter, index) => (
                    <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1 px-3 py-1"
                    >
                      {filter.value}
                      <button
                          onClick={() => {
                            if (filter.type === 'destination') setDestination('');
                            else if (filter.type === 'price') setPriceRange([0, 5000]);
                            else if (filter.type === 'travelers') setTravelers(2);
                            else if (filter.type === 'date') setSelectedDate(null);
                            else if (filter.type === 'duration') setDuration([1, 15]);
                            else if (filter.type === 'agency') {
                              setAgencyId('');
                              setAgencyInfo(null);
                            }
                            else if (filter.type === 'category') {
                              setSelectedCategories(prev => prev.filter(c => c !== filter.value));
                            }
                            removeActiveFilter(filter.type, filter.value);
                            fetchPackages();
                          }}
                          className="ml-1 hover:bg-gray-200 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                ))}
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      clearAllFilters();
                      fetchPackages();
                    }}
                    className="text-xs"
                >
                  Limpiar todos
                </Button>
              </div>
            </div>
        )}

        {/* Mobile filter button */}
        <div className="md:hidden mb-4">
          <Button
              onClick={() => setMobileFiltersOpen(true)}
              variant="outline"
              className="w-full"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className={`space-y-6 ${mobileFiltersOpen ? 'fixed inset-0 z-50 bg-white p-6 overflow-auto md:relative md:p-0 md:bg-transparent md:z-auto' : 'hidden md:block'}`}>
            {mobileFiltersOpen && (
                <div className="flex items-center justify-between mb-4 md:hidden">
                  <h2 className="text-lg font-semibold">Filtros</h2>
                  <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setMobileFiltersOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
            )}

            <Card className="p-4">
              <h2 className="text-lg font-semibold mb-4">Filtros</h2>

              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Destino</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="¿A dónde quieres ir?"
                        className="pl-10"
                        value={destination}
                        onChange={(e) => setDestination(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Fecha de viaje</label>
                  <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                    <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          className={cn(
                              "w-full justify-start text-left font-normal",
                              !selectedDate && "text-muted-foreground"
                          )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? (
                            format(selectedDate, "PPP", { locale: es })
                        ) : (
                            "Seleccionar fecha"
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setCalendarOpen(false);
                          }}
                          disabled={(date) => date < new Date()}
                          initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Rango de Precio (USD)</label>
                  <div className="pt-6 px-2">
                    <Slider
                        defaultValue={priceRange}
                        min={0}
                        max={5000}
                        step={100}
                        value={priceRange}
                        onValueChange={setPriceRange}
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Duración (días)</label>
                  <div className="pt-6 px-2">
                    <Slider
                        defaultValue={duration}
                        min={1}
                        max={15}
                        step={1}
                        value={duration}
                        onValueChange={setDuration}
                    />
                    <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                      <span>{duration[0]} {duration[0] === 1 ? 'día' : 'días'}</span>
                      <span>{duration[1]} días</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Número de Viajeros</label>
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
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Categorías</label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                              id={`category-${category}`}
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => handleCategoryChange(category)}
                          />
                          <label
                              htmlFor={`category-${category}`}
                              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {category}
                          </label>
                        </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col space-y-2 pt-4">
                  <Button onClick={handleApplyFilters}>
                    Aplicar Filtros
                  </Button>
                  <Button variant="outline" onClick={() => {
                    clearAllFilters();
                    fetchPackages();
                  }}>
                    Limpiar Filtros
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="md:col-span-3">
            {loading ? (
                <div className="flex justify-center items-center h-64">
                  <p>Cargando paquetes...</p>
                </div>
            ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-muted-foreground">
                      {packages.length} paquetes encontrados
                    </p>
                    <div className="flex items-center space-x-2">
                      <label className="text-sm">Ordenar por:</label>
                      <select
                          className="border rounded-md p-1 text-sm"
                          value={sortOption}
                          onChange={handleSortChange}
                      >
                        <option value="price-asc">Precio: Menor a Mayor</option>
                        <option value="price-desc">Precio: Mayor a Menor</option>
                        <option value="duration-asc">Duración: Menor a Mayor</option>
                        <option value="duration-desc">Duración: Mayor a Menor</option>
                      </select>
                    </div>
                  </div>

                  {packages.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {packages.map((pkg) => (
                            <Link key={pkg._id} href={`/paquetes/${pkg._id}`} className="group">
                              <Card className="overflow-hidden h-full">
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
                                      <span>{pkg.rating || 4.5}</span>
                                    </div>
                                  </div>
                                  <p className="text-sm text-muted-foreground mb-2">{pkg.description.substring(0, 60)}...</p>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <MapPin className="h-4 w-4"/>
                                    <span>{pkg.destination}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                    <CalendarIcon className="h-4 w-4"/>
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
                              </Card>
                            </Link>
                        ))}
                      </div>
                  ) : (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-lg font-medium mb-2">No se encontraron paquetes</p>
                        <p className="text-muted-foreground mb-4">Intenta con otros filtros o destinos</p>
                        <Button onClick={() => {
                          clearAllFilters();
                          fetchPackages();
                        }}>Limpiar Filtros</Button>
                      </div>
                  )}
                </>
            )}
          </div>
        </div>
      </div>
  );
}