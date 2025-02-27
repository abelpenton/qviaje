"use client";

import { useState } from 'react';
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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {Trash, Trash2} from 'lucide-react'

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
    images: z.any().refine((files) => files?.length > 0, 'Por favor suba al menos una imagen')
        .refine((files) => Array.from(files).every(file => file.type.startsWith('image/')), 'Solo se permiten imágenes'),
});

export default function NewPackagePage() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [startDates, setStartDates] = useState([]);
    const [newDate, setNewDate] = useState(null);
    const [newSpots, setNewSpots] = useState('');
    const [newPrice, setNewPrice] = useState('');
    const [dateOpen, setDateOpen] = useState(false);

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
            minPeople: '1',
            maxPeople: '10'
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

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsLoading(true);

            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                if (key === 'images') {
                    Array.from(value).forEach((file) => formData.append('images', file));
                } else {
                    formData.append(key, value);
                }
            });

            // Añadir las fechas de inicio
            formData.append('startDates', JSON.stringify(startDates.map(date => ({
                date: date.date,
                availableSpots: date.availableSpots,
                price: date.price
            }))));

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
                                                    <Trash className="h-4 w-4 text-red-500" />
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