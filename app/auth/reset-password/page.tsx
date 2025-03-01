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
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

const formSchema = z.object({
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export default function ResetPasswordPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [isError, setIsError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const token = searchParams.get('token');
    const type = searchParams.get('type') || 'user';

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            password: '',
            confirmPassword: '',
        },
    });

    useEffect(() => {
        if (!token) {
            setIsError(true);
            setErrorMessage('Token de restablecimiento no válido o faltante');
        }
    }, [token]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!token) {
            setIsError(true);
            setErrorMessage('Token de restablecimiento no válido o faltante');
            return;
        }

        try {
            setIsLoading(true);

            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token,
                    password: values.password,
                    type
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al restablecer la contraseña');
            }

            setIsSuccess(true);
            toast.success('Contraseña restablecida exitosamente');
        } catch (error) {
            console.error('Error al restablecer contraseña:', error);
            setIsError(true);
            setErrorMessage(error.message || 'Error al restablecer la contraseña');
            toast.error(error.message || 'Error al restablecer la contraseña');
        } finally {
            setIsLoading(false);
        }
    }

    if (isError) {
        return (
            <div className="container max-w-md mx-auto py-10">
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Error</h1>
                    </div>

                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            {errorMessage || 'Ha ocurrido un error al procesar tu solicitud de restablecimiento de contraseña.'}
                        </AlertDescription>
                    </Alert>

                    <div className="text-center">
                        <Link href="/auth/login">
                            <Button>Volver al inicio de sesión</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="container max-w-md mx-auto py-10">
                <div className="space-y-6">
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">¡Contraseña restablecida!</h1>
                    </div>

                    <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <AlertDescription>
                            Tu contraseña ha sido restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.
                        </AlertDescription>
                    </Alert>

                    <div className="text-center">
                        <Link href="/auth/login">
                            <Button>Iniciar sesión</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container max-w-md mx-auto py-10">
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold mb-4">Restablecer contraseña</h1>
                    <p className="text-muted-foreground">
                        Ingresa tu nueva contraseña a continuación
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nueva contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirmar contraseña</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Procesando...' : 'Restablecer contraseña'}
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}