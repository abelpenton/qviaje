// @ts-nocheck
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const formSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    subject: z.string().min(5, 'El asunto debe tener al menos 5 caracteres'),
    message: z.string().min(20, 'El mensaje debe tener al menos 20 caracteres'),
});

export default function ContactoPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            subject: '',
            message: '',
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            setIsSubmitting(true);

            // Simulación de envío de formulario
            await new Promise(resolve => setTimeout(resolve, 1500));

            console.log('Formulario enviado:', values);

            // Mostrar mensaje de éxito
            toast.success('Mensaje enviado correctamente. Nos pondremos en contacto contigo pronto.');

            // Resetear formulario
            form.reset();
        } catch (error) {
            console.error('Error al enviar el formulario:', error);
            toast.error('Error al enviar el mensaje. Por favor intenta nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="container mx-auto py-10 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold mb-4">Contacto</h1>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                        ¿Tienes alguna pregunta o comentario? Estamos aquí para ayudarte. Completa el formulario a continuación y nos pondremos en contacto contigo lo antes posible.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Información de contacto */}
                    <div className="space-y-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Mail className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-medium mb-1">Email</h3>
                                        <p className="text-muted-foreground">info@qviaje.com</p>
                                        <p className="text-muted-foreground">soporte@qviaje.com</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <Phone className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-medium mb-1">Teléfono</h3>
                                        <p className="text-muted-foreground">+1 (555) 123-4567</p>
                                        <p className="text-muted-foreground">Lun - Vie: 9:00 - 18:00</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <MapPin className="h-6 w-6 text-primary mt-1" />
                                    <div>
                                        <h3 className="font-medium mb-1">Ubicación</h3>
                                        <p className="text-muted-foreground">
                                            Av. Tecnológico 123, Col. Centro
                                        </p>
                                        <p className="text-muted-foreground">
                                            Ciudad de México, México
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Formulario de contacto */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Envíanos un mensaje</CardTitle>
                                <CardDescription>
                                    Completa el formulario a continuación y te responderemos lo antes posible.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Nombre completo</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="Tu nombre" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <FormField
                                                control={form.control}
                                                name="email"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Email</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} type="email" placeholder="tu@email.com" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>

                                        <FormField
                                            control={form.control}
                                            name="subject"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Asunto</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="¿Sobre qué nos quieres contactar?" />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="message"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Mensaje</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            {...field}
                                                            placeholder="Escribe tu mensaje aquí..."
                                                            rows={6}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <Button type="submit" className="w-full" disabled={isSubmitting}>
                                            {isSubmitting ? (
                                                <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Enviando...
                        </span>
                                            ) : (
                                                <span className="flex items-center">
                          <Send className="mr-2 h-4 w-4" />
                          Enviar mensaje
                        </span>
                                            )}
                                        </Button>
                                    </form>
                                </Form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Mapa o información adicional */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold mb-6 text-center">Preguntas Frecuentes</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="text-lg font-medium mb-2">¿Cuánto tiempo tardan en responder?</h3>
                            <p className="text-muted-foreground">
                                Nos esforzamos por responder a todas las consultas dentro de las 24-48 horas hábiles siguientes a su recepción.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">¿Puedo solicitar soporte técnico?</h3>
                            <p className="text-muted-foreground">
                                Sí, puedes contactarnos para cualquier problema técnico que encuentres en la plataforma. Te recomendamos incluir capturas de pantalla si es posible.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">¿Cómo puedo reportar un problema con una agencia?</h3>
                            <p className="text-muted-foreground">
                                Si tienes algún problema con una agencia, puedes contactarnos a través de este formulario seleccionando Reportar agencia en el asunto y proporcionando todos los detalles relevantes.
                            </p>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">¿Ofrecen soporte en otros idiomas?</h3>
                            <p className="text-muted-foreground">
                                Actualmente ofrecemos soporte en español, inglés y portugués. Por favor indica tu idioma preferido en tu mensaje.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}