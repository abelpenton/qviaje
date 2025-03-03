//@ts-nocheck
"use client";

import {useEffect, useState} from 'react'
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
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {  Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';
import useAgency from '@/hooks/useAgency'

const formSchema = z.object({
    title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
    description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
    destination: z.string().min(3, 'El destino debe tener al menos 3 caracteres'),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio debe ser un número válido con hasta dos decimales')
        .min(1, 'Por favor ingrese un precio'),
    discountPercentage: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Descuento debe ser un número válido con hasta dos decimales')
        .optional(),
    durationDays: z
        .string()
        .min(1, "Por favor ingrese los días de duración")
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: "Debe ser un número válido mayor a 0",
        }),
    durationNights: z
        .string()
        .min(1, "Por favor ingrese las noches de duración")
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: "Debe ser un número válido mayor o igual a 0",
        }),
    included: z.string().min(10, 'Por favor detalle qué incluye el paquete'),
    notIncluded: z.string().min(10, 'Por favor detalle qué no incluye el paquete'),
    maxPeople: z.string(),
    minPeople: z.string(),
    images: z.any().refine((files) => files?.length > 0, 'Por favor suba al menos una imagen')
        .refine((files) => Array.from(files).every(file => file.type.startsWith('image/')), 'Solo se permiten imágenes'),
    category: z.array(z.string()).optional(),
}).refine((data) => Number(data.durationNights) <= Number(data.durationDays), {
    message: "El número de noches no puede ser mayor al número de días",
    path: ["durationNights"], // Muestra el error en el campo correspondiente
});

export default function NewPackagePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [startDates, setStartDates] = useState([]);
    const [newDate, setNewDate] = useState(null);
    const [newSpots, setNewSpots] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [dateOpen, setDateOpen] = useState(false);
    const [itinerary, setItinerary] = useState([
        {
            day: 1,
            title: '',
            description: '',
            activities: [{ time: '', description: '' }],
            meals: { breakfast: false, lunch: false, dinner: false },
            accommodation: ''
        }
    ]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const {agency,} = useAgency()
    const [agencyPackage, setAgencyPackages] = useState([])

    useEffect(() => {
        if (agency && agencyPackage.length > 0) {
            const allPackages = agencyPackage.length
            const isFree = agency.subscriptionPlan === "free"
            if (isFree && allPackages === 100) {
                router.push("/dashboard/paquetes")
            }
        }
    }, [agency, agencyPackage])

    useEffect(() => {
        const fetchPackages = async () => {
            try {
                const response = await fetch('/api/packages?agencyId=' + agency?._id);
                const data = await response.json();

                if (response.ok) {
                    setAgencyPackages(data);
                } else {
                    console.error('Error al obtener los paquetes:', data.error);
                }
            } catch (error) {
                console.error('Error de red:', error);
            }
        };

        if (agency) {
            fetchPackages();
        }
    }, [agency]);


    const categories = [
        'Playa', 'Montaña', 'Ciudad', 'Aventura', 'Relax',
        'Cultural', 'Familiar', 'Romántico', 'Lujo', 'Económico'
    ];

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            destination: '',
            price: '',
            discountPercentage: '0',
            durationDays: '',
            durationNights: '',
            included: '',
            notIncluded: '',
            minPeople: '1',
            maxPeople: '10',
            category: []
        },
    });

    const addStartDate = () => {
        if (!newDate) {
            toast.error('Por favor seleccione una fecha');
            return;
        }

        if (!newSpots || parseInt(newSpots) <= 0) {
            toast.error('Por favor ingrese un número válido de plazas disponibles');
            return;
        }

        if (!newPrice || parseFloat(newPrice) <= 0) {
            toast.error('Por favor ingrese un precio válido');
            return;
        }

        // Verificar si la fecha ya existe
        const dateExists = startDates.some(
            date => new Date(date.date).toDateString() === newDate.toDateString()
        );

        if (dateExists) {
            toast.error('Esta fecha ya ha sido agregada');
            return;
        }

        setStartDates([
            ...startDates,
            {
                date: newDate,
                availableSpots: parseInt(newSpots),
                price: parseFloat(newPrice)
            }
        ]);

        // Limpiar los campos
        setNewDate(null);
        setNewSpots('');
        setNewPrice('');
        setDateOpen(false);
    };

    const removeStartDate = (index) => {
        setStartDates(startDates.filter((_, i) => i !== index));
    };

    // Funciones para manejar el itinerario
    const addDay = () => {
        const newDay = {
            day: itinerary.length + 1,
            title: '',
            description: '',
            activities: [{ time: '', description: '' }],
            meals: { breakfast: false, lunch: false, dinner: false },
            accommodation: ''
        };
        setItinerary([...itinerary, newDay]);
    };

    const removeDay = (index) => {
        if (itinerary.length <= 1) {
            toast.error('Debe haber al menos un día en el itinerario');
            return;
        }

        const newItinerary = itinerary.filter((_, i) => i !== index);
        // Reordenar los días
        const updatedItinerary = newItinerary.map((day, i) => ({
            ...day,
            day: i + 1
        }));

        setItinerary(updatedItinerary);
    };

    const updateDay = (index, field, value) => {
        const updatedItinerary = [...itinerary];
        updatedItinerary[index][field] = value;
        setItinerary(updatedItinerary);
    };

    const addActivity = (dayIndex) => {
        const updatedItinerary = [...itinerary];
        updatedItinerary[dayIndex].activities.push({ time: '', description: '' });
        setItinerary(updatedItinerary);
    };

    const removeActivity = (dayIndex, activityIndex) => {
        if (itinerary[dayIndex].activities.length <= 1) {
            toast.error('Debe haber al menos una actividad por día');
            return;
        }

        const updatedItinerary = [...itinerary];
        updatedItinerary[dayIndex].activities = updatedItinerary[dayIndex].activities.filter((_, i) => i !== activityIndex);
        setItinerary(updatedItinerary);
    };

    const updateActivity = (dayIndex, activityIndex, field, value) => {
        const updatedItinerary = [...itinerary];
        updatedItinerary[dayIndex].activities[activityIndex][field] = value;
        setItinerary(updatedItinerary);
    };

    const updateMeals = (dayIndex, meal, value) => {
        const updatedItinerary = [...itinerary];
        updatedItinerary[dayIndex].meals[meal] = value;
        setItinerary(updatedItinerary);
    };

    const handleCategoryChange = (category) => {
        setSelectedCategories(prev => {
            if (prev.includes(category)) {
                return prev.filter(c => c !== category);
            } else {
                return [...prev, category];
            }
        });
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true);

            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key === 'images') {
                    Array.from(value).forEach((file) => formData.append('images', file));
                } else if (key === 'category') {
                    // Skip, we'll handle categories separately
                } else if (key === 'durationDays' || key === 'durationNights') {
                    // Skip, we'll handle duration separately
                } else {
                    formData.append(key, value);
                }
            });

            // Add duration
            formData.append('duration', JSON.stringify({
                days: parseInt(values.durationDays),
                nights: parseInt(values.durationNights)
            }));

            // Añadir las categorías seleccionadas
            formData.append('category', JSON.stringify(selectedCategories));

            // Añadir las fechas de inicio
            formData.append('startDates', JSON.stringify(startDates.map(date => ({
                date: date.date,
                availableSpots: date.availableSpots,
                price: date.price
            }))));

            // Añadir el itinerario
            formData.append('itinerary', JSON.stringify(itinerary));

            const response = await fetch('/api/packages', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al crear el paquete');
            }

            toast.success('Paquete creado exitosamente');
            router.push('/dashboard/paquetes');
        } catch (error) {
            console.error('Error al crear:', error);
            toast.error(error.message || 'Error al crear el paquete');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Nuevo Paquete Turístico</h1>
                <p className="text-muted-foreground">
                    Completa la información de tu nuevo paquete turístico
                </p>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="title"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Título del paquete</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="description"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Descripción</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="destination"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>Destino</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="durationDays"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Días</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" min="1" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="durationNights"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Noches</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" min="0" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="minPeople"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Mínimo de personas</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" min="1" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="maxPeople"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Máximo de personas</FormLabel>
                                    <FormControl>
                                        <Input {...field} type="number" min="1" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="price"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Precio base (USD)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} min="0" step="0.01" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="discountPercentage"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Descuento (%)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} min="0" max="100" step="0.01" />
                                    </FormControl>
                                    <FormMessage/>
                                </FormItem>
                            )}
                        />
                    </div>

                    <FormField
                        control={form.control}
                        name="included"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>¿Qué incluye?</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Ingrese cada ítem en una línea separada" />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="notIncluded"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>¿Qué no incluye?</FormLabel>
                                <FormControl>
                                    <Textarea {...field} placeholder="Ingrese cada ítem en una línea separada" />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="images"
                        render={({field: {onChange, value, ...field}}) => (
                            <FormItem>
                                <FormLabel>Imágenes</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(e) => onChange(e.target.files)}
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />

                    {/* Categorías */}
                    <div>
                        <FormLabel>Categorías</FormLabel>
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {categories.map((category) => (
                                <div key={category} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`category-${category}`}
                                        checked={selectedCategories.includes(category)}
                                        onCheckedChange={() => handleCategoryChange(category)}
                                    />
                                    <label
                                        htmlFor={`category-${category}`}
                                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        {category}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sección de fechas de salida */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Fechas de salida</h3>
                            <p className="text-sm text-muted-foreground">
                                Agregue las fechas disponibles para este paquete
                            </p>
                        </div>

                        {startDates.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Fechas programadas</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        {startDates.map((date, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                                <div>
                                                    <p className="font-medium">
                                                        {format(new Date(date.date), 'PPP', { locale: es })}
                                                    </p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {date.availableSpots} plazas - ${date.price} USD
                                                    </p>
                                                </div>
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => removeStartDate(index)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Fecha</label>
                                <Popover open={dateOpen} onOpenChange={setDateOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !newDate && "text-muted-foreground"
                                            )}
                                        >
                                            {newDate ? (
                                                format(newDate, "PPP", { locale: es })
                                            ) : (
                                                "Seleccionar fecha"
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={newDate}
                                            onSelect={setNewDate}
                                            initialFocus
                                            disabled={(date) => date < new Date()}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Plazas</label>
                                <Input
                                    type="number"
                                    value={newSpots}
                                    onChange={(e) => setNewSpots(e.target.value)}
                                    min="1"
                                    placeholder="Ej: 10"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Precio (USD)</label>
                                <Input
                                    type="number"
                                    value={newPrice}
                                    onChange={(e) => setNewPrice(e.target.value)}
                                    min="0"
                                    step="0.01"
                                    placeholder="Ej: 1499.99"
                                />
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={addStartDate}
                        >
                            Agregar fecha
                        </Button>
                    </div>

                    {/* Sección de itinerario */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-medium">Itinerario</h3>
                            <p className="text-sm text-muted-foreground">
                                Detalle el itinerario día a día
                            </p>
                        </div>

                        <Accordion type="multiple" className="w-full">
                            {itinerary.map((day, dayIndex) => (
                                <AccordionItem key={dayIndex} value={`day-${dayIndex}`}>
                                    <AccordionTrigger className="hover:no-underline">
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <span>Día {day.day}: {day.title || 'Sin título'}</span>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeDay(dayIndex);
                                                }}
                                                className="h-8 w-8"
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="space-y-4 p-2">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Título del día</label>
                                                <Input
                                                    value={day.title}
                                                    onChange={(e) => updateDay(dayIndex, 'title', e.target.value)}
                                                    placeholder="Ej: Llegada a Cusco"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Descripción</label>
                                                <Textarea
                                                    value={day.description}
                                                    onChange={(e) => updateDay(dayIndex, 'description', e.target.value)}
                                                    placeholder="Descripción general del día"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="block text-sm font-medium">Actividades</label>
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => addActivity(dayIndex)}
                                                    >
                                                        Añadir actividad
                                                    </Button>
                                                </div>

                                                {day.activities.map((activity, activityIndex) => (
                                                    <div key={activityIndex} className="flex items-start gap-2 mb-2">
                                                        <div className="w-1/4">
                                                            <Input
                                                                value={activity.time}
                                                                onChange={(e) => updateActivity(dayIndex, activityIndex, 'time', e.target.value)}
                                                                placeholder="Hora"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <div className="flex-1">
                                                            <Input
                                                                value={activity.description}
                                                                onChange={(e) => updateActivity(dayIndex, activityIndex, 'description', e.target.value)}
                                                                placeholder="Descripción de la actividad"
                                                                className="text-sm"
                                                            />
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={() => removeActivity(dayIndex, activityIndex)}
                                                            className="h-8 w-8"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-2">Comidas incluidas</label>
                                                <div className="flex gap-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`breakfast-${dayIndex}`}
                                                            checked={day.meals.breakfast}
                                                            onCheckedChange={(checked) => updateMeals(dayIndex, 'breakfast', checked)}
                                                        />
                                                        <label htmlFor={`breakfast-${dayIndex}`} className="text-sm">Desayuno</label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`lunch-${dayIndex}`}
                                                            checked={day.meals.lunch}
                                                            onCheckedChange={(checked) => updateMeals(dayIndex, 'lunch', checked)}
                                                        />
                                                        <label htmlFor={`lunch-${dayIndex}`} className="text-sm">Almuerzo</label>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`dinner-${dayIndex}`}
                                                            checked={day.meals.dinner}
                                                            onCheckedChange={(checked) => updateMeals(dayIndex, 'dinner', checked)}
                                                        />
                                                        <label htmlFor={`dinner-${dayIndex}`} className="text-sm">Cena</label>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium mb-1">Alojamiento</label>
                                                <Input
                                                    value={day.accommodation}
                                                    onChange={(e) => updateDay(dayIndex, 'accommodation', e.target.value)}
                                                    placeholder="Ej: Hotel San Agustín Plaza"
                                                />
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={addDay}
                        >
                            Añadir día
                        </Button>
                    </div>

                    <div className="flex justify-end space-x-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isLoading}
                        >
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Creando...' : 'Crear Paquete'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}