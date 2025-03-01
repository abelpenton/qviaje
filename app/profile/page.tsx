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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email inválido'),
    phone: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
    photo: z.any().optional(),
});

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [photoFile, setPhotoFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState('');
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            phone: '',
        },
    });

    useEffect(() => {
        // Redirect if not logged in or not a user
        if (status === 'unauthenticated' || (session?.user?.type !== 'user')) {
            router.push('/auth/login');
            return;
        }

        const fetchUserData = async () => {
            if (!session?.user?.id) return;

            try {
                setLoading(true);
                const response = await fetch(`/api/users/${session.user.id}`);

                if (!response.ok) {
                    toast.error('No se pudo cargar la información del usuario');
                }

                const data = await response.json();
                console.log(data)
                setUser(data);

                // Actualizar el formulario con los datos
                form.reset({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                });

                setPhotoPreview(data.photo);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error al cargar los datos del usuario');
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.id) {
            fetchUserData();
        }
    }, [session, form, router, status]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            setUpdating(true);

            const formData = new FormData();

            // Agregar los campos del formulario
            Object.entries(values).forEach(([key, value]) => {
                if (key !== 'photo') {
                    formData.append(key, value);
                }
            });

            // Agregar foto si se cambió
            if (photoFile) {
                formData.append('photo', photoFile);
            }

            const response = await fetch(`/api/users/${session.user.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Error al actualizar la información');
            }

            const updatedUser = await response.json();
            setUser(updatedUser);

            toast.success('Información actualizada exitosamente');
        } catch (error) {
            console.error('Error al actualizar:', error);
            toast.error(error.message || 'Error al actualizar la información');
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64">Cargando información...</div>;
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
                    <p className="text-muted-foreground">
                        Administra tu información personal
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>
                            Actualiza tus datos personales
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <div className="flex flex-col items-center mb-6">
                                    <div className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-gray-200 mb-4">
                                        {photoPreview ? (
                                            <Image
                                                src={photoPreview}
                                                alt="Foto de perfil"
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                                <Upload className="h-8 w-8 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="photo"
                                        render={({ field: { onChange, value, ...field } }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            onChange(e.target.files);
                                                            handlePhotoChange(e);
                                                        }}
                                                        {...field}
                                                        className="max-w-xs"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nombre completo</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
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
                                                <Input type="email" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Teléfono</FormLabel>
                                            <FormControl>
                                                <Input {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex justify-end">
                                    <Button type="submit" disabled={updating}>
                                        {updating ? 'Guardando...' : 'Guardar Cambios'}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}