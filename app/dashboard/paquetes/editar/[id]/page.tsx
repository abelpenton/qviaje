//@ts-nocheck
"use client";

import { useState, useEffect } from 'react';
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

// Modificamos el esquema para hacer las imágenes opcionales en la edición
const formSchema = z.object({
    title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
    description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
    destination: z.string().min(3, 'El destino debe tener al menos 3 caracteres'),
    price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Precio debe ser un número válido con hasta dos decimales')
        .min(1, 'Por favor ingrese un precio'),
    duration: z.string().regex(/^\d+ días \/ \d+ noches$/, 'Formato inválido. Ejemplo: 5 días / 4 noches')
        .min(1, 'Por favor ingrese la duración'),
    included: z.string().min(10, 'Por favor detalle qué incluye el paquete'),
    notIncluded: z.string().min(10, 'Por favor detalle qué no incluye el paquete'),
    maxPeople: z.string(),
    minPeople: z.string(),
    images: z.any()
        .optional()
        .refine(
            (files) => !files || files.length === 0 || Array.from(files).every(file => file.type.startsWith('image/')),
            'Solo se permiten imágenes'
        ),
    category: z.array(z.string()).optional(),
});

export default function EditPackagePage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingPackage, setIsLoadingPackage] = useState(true);
    const [currentImages, setCurrentImages] = useState([]);
    const [startDates, setStartDates] = useState([]);
    const [newDate, setNewDate] = useState(null);
    const [newSpots, setNewSpots] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [dateOpen, setDateOpen] = useState(false);
    const [itinerary, setItinerary] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const { id } = params;

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
            duration: '',
            included: '',
            notIncluded: '',
            minPeople: '',
            maxPeople: ''
        },
    });

    // Cargar los datos del paquete
    useEffect(() => {
        const fetchPackage = async () => {
            try {
                setIsLoadingPackage(true);
                const response = await fetch(`/api/packages/${id}`);

                if (!response.ok) {
                    throw new Error('No se pudo cargar el paquete');
                }

                const packageData = await response.json();

                // Formatear los datos para el formulario
                form.reset({
                    title: packageData.title,
                    description: packageData.description,
                    destination: packageData.destination,
                    price: packageData.price.toString(),
                    duration: `${packageData.duration.days} días / ${packageData.duration.nights} noches`,
                    included: packageData.included.join('\n'),
                    notIncluded: packageData.notIncluded.join('\n'),
                    minPeople: packageData.minPeople?.toString() || '1',
                    maxPeople: packageData.maxPeople.toString(),
                    category: packageData.category || []
                });

                // Guardar las imágenes actuales
                setCurrentImages(packageData.images || []);

                // Guardar las fechas de salida
                if (packageData.startDates && packageData.startDates.length > 0) {
                    setStartDates(packageData.startDates.map(date => ({
                        date: new Date(date.date),
                        availableSpots: date.availableSpots,
                        price: date.price
                    })));
                }

                // Guardar el itinerario
                if (packageData.itinerary && packageData.itinerary.length > 0) {
                    setItinerary(packageData.itinerary);
                } else {
                    // Inicializar con un día vacío si no hay itinerario
                    setItinerary([{
                        day: 1,
                        title: '',
                        description: '',
                        activities: [{ time: '', description: '' }],
                        meals: { breakfast: false, lunch: false, dinner: false },
                        accommodation: ''
                    }]);
                }

                // Guardar las categorías
                if (packageData.category && packageData.category.length > 0) {
                    setSelectedCategories(packageData.category);
                }
            } catch (error) {
                console.error('Error al cargar el paquete:', error);
                toast.error('Error al cargar el paquete');
                router.push('/dashboard/paquetes');
            } finally {
                setIsLoadingPackage(false);
            }
        };

        fetchPackage();
    }, [id, form, router]);

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
                    if (value && value.length > 0) {
                        Array.from(value).forEach((file) => formData.append('images', file));
                    }
                } else if (key === 'category') {
                    // Skip, we'll handle categories separately
                } else {
                    formData.append(key, value);
                }
            });

            // Añadir el ID del paquete
            formData.append('id', id);

            // Añadir las imágenes actuales (para mantenerlas si no se suben nuevas)
            formData.append('currentImages', JSON.stringify(currentImages));

            // Añadir las fechas de salida
            formData.append('startDates', JSON.stringify(startDates.map(date => ({
                date: date.date,
                availableSpots: date.availableSpots,
                price: date.price
            }))));

            // Añadir el itinerario
            formData.append('itinerary', JSON.stringify(itinerary));

            // Añadir las categorías
            formData.append('category', JSON.stringify(selectedCategories));

            const response = await fetch(`/api/packages/${id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al actualizar el paquete');
            }

            toast.success('Paquete actualizado exitosamente');
            router.push('/dashboard/paquetes');
        } catch (error) {
            console.error('Error al actualizar:', error);
            toast.error(error.message || 'Error al actualizar el paquete');
        } finally {
            setIsLoading(false);
        }
    }

    if (isLoadingPackage) {
        return <div className="flex justify-center items-center h-64">Cargando paquete...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Editar Paquete Turístico</h1>
                <p className="text-muted-foreground">
                    Actualiza la información de tu paquete turístico
                </p>
            </div>

            {currentImages.length > 0 && (
                <div>
                    <h3 className="text-lg font-medium mb-2">Imágenes actuales</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {currentImages.map((image, index) => (
                            <div key={index} className="relative">
                                <img
                                    src={image.url}
                                    alt={image.alt || 'Imagen del paquete'}
                                    className="w-full h-32 object-cover rounded-md"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

                    <div className="grid grid-cols-2 gap-4">
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

                        <FormField
                            control={form.control}
                            name="duration"
                            render={({field}) => (
                                <FormItem>
                                    <FormLabel>Duración</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Ej: 5 días / 4 noches"/>
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
                        name="included"
                        render={({field}) => (
                            <FormItem>
                                <FormLabel>¿Qué incluye?</FormLabel>
                                <FormControl>
                                    <Textarea {...field} />
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
                                    <Textarea {...field} />
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
                                <FormLabel>Nuevas imágenes (opcional)</FormLabel>
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
                                Gestione las fechas disponibles para este paquete
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
                            {isLoading ? 'Actualizando...' : 'Actualizar Paquete'}
                        </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}