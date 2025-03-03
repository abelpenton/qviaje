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
import toast from 'react-hot-toast';
import useTelegramBot from '@/hooks/useTelegramBot'

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  location: z.string().min(5, 'La localización debe tener al menos 5 caracteres'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
  website: z.string().optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  logo: z.any().refine((file) => file?.length > 0, 'Por favor suba un logo'),
});

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const {sendMessageToTelegram} = useTelegramBot()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      description: '',
      location: '',
      phone: '',
      website: '',
      instagram: '',
      facebook: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      const formData = new FormData();
      Object.entries(values).forEach(([key, value]) => {
        if (key === 'logo') {
          formData.append(key, value[0]);
        } else {
          formData.append(key, value);
        }
      });

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        toast.error('Error al registrar la agencia');
      }

      await sendMessageToTelegram(`New agency registered: ${values.name}`)
      toast.success('Registro exitoso');
      router.push('/auth/login');
    } catch (error) {
      toast.error('Error al registrar la agencia');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Registra tu agencia</h1>
          <p className="text-muted-foreground">
            Completa el formulario para comenzar a publicar tus paquetes turísticos
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre de la agencia</FormLabel>
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
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="logo"
              render={({ field: { onChange, value, ...field } }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => onChange(e.target.files)}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Localización</FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                      <p className="text-sm text-muted-foreground mt-2">
                          Este número será utilizado para que los clientes te contacten por WhatsApp.
                          Asegúrate de incluir el código de tu país (Ejemplo: +598 para Uruguay, +55 para Brasil).
                      </p>
                      <FormMessage/>
                  </FormItem>
              )}
            />

              <FormField
                  control={form.control}
                  name="website"
                  render={({field}) => (
                      <FormItem>
                          <FormLabel>Sitio web (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
              <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Cuenta de Instagram (opcional)</FormLabel>
                          <FormControl>
                              <Input {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />
              <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                      <FormItem>
                          <FormLabel>Cuenta de Facebook (opcional)</FormLabel>
                          <FormControl>
                              <Input {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                  )}
              />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrar agencia'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}