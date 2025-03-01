//@ts-nocheck
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
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import Link from 'next/link'
import {Alert, AlertDescription} from '@/components/ui/alert'
import {AlertCircle} from 'lucide-react'

const formSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Por favor ingrese su contraseña'),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes('@')) {
      toast.error('Por favor ingrese un email válido');
      return;
    }

    try {
      setIsLoading(true);

      // Call the forgot-password API endpoint
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.error || 'Error al enviar instrucciones de recuperación');
      }

      setResetSent(true);
      toast.success('Instrucciones de recuperación enviadas a su email');
    } catch (error) {
      console.error('Error al solicitar recuperación de contraseña:', error);
      toast.error(error.message || 'Error al enviar instrucciones de recuperación');
    } finally {
      setIsLoading(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const result = await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      console.log(result)

      if (result?.error) {
        toast.error('Email o contraseña incorrectos');
        return;
      }

      router.push('/');
      toast.success('Inicio de sesión exitoso');
    } catch (error) {
      toast.error('Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <div className="container max-w-md mx-auto py-10">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Iniciar sesión</h1>
            <p className="text-muted-foreground">
              Ingresa tus credenciales para acceder a tu cuenta
            </p>
          </div>
          {
            showForgotPassword && (
                  <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <h2 className="text-xl font-semibold mb-4">Recuperar contraseña</h2>
                    {resetSent ? (
                        <div className="space-y-4">
                          <Alert variant="success" className="bg-green-50 border-green-200 text-green-800">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Hemos enviado instrucciones para recuperar tu contraseña al email proporcionado. Por favor revisa tu bandeja de entrada y sigue las instrucciones.
                            </AlertDescription>
                          </Alert>
                          <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                setShowForgotPassword(false);
                                setResetSent(false);
                              }}
                          >
                            Volver al inicio de sesión
                          </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Email</label>
                            <Input
                                type="email"
                                value={forgotEmail}
                                onChange={(e) => setForgotEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                              Ingresa el email asociado a tu cuenta.
                            </p>
                          </div>
                          <div className="flex flex-col space-y-2">
                            <Button type="submit" className="w-full" disabled={isLoading}>
                              {isLoading ? 'Enviando...' : 'Enviar instrucciones'}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setShowForgotPassword(false)}
                            >
                              Volver al inicio de sesión
                            </Button>
                          </div>
                        </form>
                    )}
                  </div>
              )
          }
          {
            !showForgotPassword && (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                          control={form.control}
                          name="email"
                          render={({field}) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" {...field} />
                                </FormControl>
                                <FormMessage/>
                              </FormItem>
                          )}
                      />

                      <FormField
                          control={form.control}
                          name="password"
                          render={({field}) => (
                              <FormItem>
                                <FormLabel>Contraseña</FormLabel>
                                <FormControl>
                                  <Input type="password" {...field} />
                                </FormControl>
                                <FormMessage/>
                              </FormItem>
                          )}
                      />

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                      </Button>
                    </form>
                  </Form>
            )
          }
        </div>
        <div className="text-center text-sm space-y-2 mt-4">
          <p className="text-muted-foreground">
            ¿No tienes una cuenta?{' '}
            <Link href="/auth" className="text-primary hover:underline">
              Regístrate aquí
            </Link>
          </p>
          <button
              onClick={() => setShowForgotPassword(true)}
              className="text-primary hover:underline"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>
      </div>
  );
}