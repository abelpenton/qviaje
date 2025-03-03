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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import {  CheckCircle,  AlertCircle,  Upload,  ExternalLink } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres').max(500, 'La descripción no puede tener más de 500 caracteres'),
    location: z.string().min(3, 'La localización debe tener al menos 3 caracteres'),
    phone: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
    website: z.string().url('URL inválida').optional().or(z.literal('')),
    facebook: z.string().url('URL inválida').optional().or(z.literal('')),
    instagram: z.string().url('URL inválida').optional().or(z.literal('')),
    twitter: z.string().url('URL inválida').optional().or(z.literal('')),
});

const socialMediaSchema = z.object({
    website: z.string().url('URL inválida'),
    facebook: z.string().url('URL inválida'),
    instagram: z.string().url('URL inválida'),
});

export default function ConfiguracionPage() {
    const { data: session } = useSession();
    const [agency, setAgency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState('');
    const [verificationStatus, setVerificationStatus] = useState({
        eligible: false,
        reasons: [],
    });
    const router = useRouter();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            description: '',
            location: '',
            phone: '',
            website: '',
            facebook: '',
            instagram: '',
            twitter: '',
        },
    });

    useEffect(() => {
        const fetchAgencyData = async () => {
            if (!session?.user?.id) return;

            try {
                setLoading(true);
                const response = await fetch(`/api/agencies/${session.user.id}`);

                if (!response.ok) {
                    toast.error('No se pudo cargar la información de la agencia');
                }

                const data = await response.json();
                setAgency(data);

                // Actualizar el formulario con los datos
                form.reset({
                    name: data.name,
                    email: data.email,
                    description: data.description,
                    location: data.location,
                    phone: data.phone,
                    website: data.website || '',
                    facebook: data.socialMedia?.facebook || '',
                    instagram: data.socialMedia?.instagram || '',
                    twitter: data.socialMedia?.twitter || '',
                });

                setLogoPreview(data.logo);

                // Verificar elegibilidad para verificación
                checkVerificationEligibility(data);
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error al cargar los datos de la agencia');
            } finally {
                setLoading(false);
            }
        };

        fetchAgencyData();
    }, [session, form]);

    const checkVerificationEligibility = (agencyData) => {
        const reasons = [];

        if (!agencyData.logo) {
            reasons.push('Debe subir un logo de la agencia');
        }

        if (!agencyData.website) {
            reasons.push('Debe proporcionar un sitio web');
        }

        if (!agencyData.socialMedia?.facebook) {
            reasons.push('Debe proporcionar un perfil de Facebook');
        }

        if (!agencyData.socialMedia?.instagram) {
            reasons.push('Debe proporcionar un perfil de Instagram');
        }

        setVerificationStatus({
            eligible: reasons.length === 0,
            reasons,
        });
    };

    const handleLogoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setLogoPreview(reader.result as string);
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
                if (key !== 'facebook' && key !== 'instagram' && key !== 'twitter') {
                    formData.append(key, value);
                }
            });

            // Agregar redes sociales
            formData.append('socialMedia', JSON.stringify({
                facebook: values.facebook,
                instagram: values.instagram,
                twitter: values.twitter,
            }));

            // Agregar logo si se cambió
            if (logoFile) {
                formData.append('logo', logoFile);
            }

            const response = await fetch(`/api/agencies/${session.user.id}`, {
                method: 'PUT',
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Error al actualizar la información');
            }

            const updatedAgency = await response.json();
            setAgency(updatedAgency);

            // Verificar elegibilidad para verificación
            checkVerificationEligibility(updatedAgency);

            toast.success('Información actualizada exitosamente');
        } catch (error) {
            console.error('Error al actualizar:', error);
            toast.error(error.message || 'Error al actualizar la información');
        } finally {
            setUpdating(false);
        }
    };

    const handleVerification = async () => {
        try {
            setVerifying(true);

            // Validar que se cumplan todos los requisitos
            if (!verificationStatus.eligible) {
                toast.error('No cumple con todos los requisitos para la verificación');
                return;
            }

            // Validar URLs con el esquema
            try {
                socialMediaSchema.parse({
                    website: form.getValues('website'),
                    facebook: form.getValues('facebook'),
                    instagram: form.getValues('instagram'),
                });
            } catch (error) {
                toast.error('Por favor verifique que todas las URLs sean válidas');
                return;
            }

            const response = await fetch(`/api/agencies/${session.user.id}/verify`, {
                method: 'POST',
            });

            if (!response.ok) {
                const error = await response.json();
                toast.error(error.message || 'Error al solicitar verificación');
            }

            const updatedAgency = await response.json();
            setAgency(updatedAgency);

            toast.success('¡Felicidades! Su agencia ha sido verificada');
            router.refresh();
        } catch (error) {
            console.error('Error al verificar:', error);
            toast.error(error.message || 'Error al solicitar verificación');
        } finally {
            setVerifying(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }
    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Configuración de la Agencia</h1>
                <p className="text-muted-foreground">
                    Administre la información y configuración de su agencia
                </p>
            </div>

            <Tabs defaultValue="profile">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Perfil</TabsTrigger>
                    <TabsTrigger value="verification">Verificación</TabsTrigger>
                </TabsList>

                <TabsContent value="profile" className="space-y-6 mt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="flex flex-col md:flex-row gap-6">
                                <Card className="w-full md:w-1/3">
                                    <CardHeader>
                                        <CardTitle>Logo</CardTitle>
                                        <CardDescription>
                                            Sube el logo de tu agencia
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="relative w-40 h-40 rounded-full overflow-hidden border mb-4">
                                                {logoPreview ? (
                                                    <Image
                                                        src={logoPreview}
                                                        alt="Logo de la agencia"
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <Upload className="h-12 w-12 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <Input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleLogoChange}
                                                className="max-w-xs"
                                            />
                                            <p className="text-xs text-muted-foreground mt-2">
                                                Formatos: JPG, PNG. Máx 2MB
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="w-full md:w-2/3">
                                    <CardHeader>
                                        <CardTitle>Información General</CardTitle>
                                        <CardDescription>
                                            Actualiza la información principal de tu agencia
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name="name"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Nombre de la Agencia</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="email"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Email</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} type="email" />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="phone"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Teléfono</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="location"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Ubicación</FormLabel>
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
                                                        <Textarea
                                                            {...field}
                                                            rows={4}
                                                            maxLength={500}
                                                        />
                                                    </FormControl>
                                                    <p className="text-xs text-muted-foreground text-right">
                                                        {field.value.length}/500 caracteres
                                                    </p>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Sitio Web y Redes Sociales</CardTitle>
                                    <CardDescription>
                                        Añade enlaces a tu sitio web y perfiles de redes sociales
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="website"
                                        render={({field}) => (
                                            <FormItem>
                                                <FormLabel>Sitio Web</FormLabel>
                                                <FormControl>
                                                    <Input {...field} placeholder="https://www.tuagencia.com" />
                                                </FormControl>
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="facebook"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Facebook</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="https://facebook.com/tuagencia" />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="instagram"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Instagram</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="https://instagram.com/tuagencia" />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="twitter"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Twitter</FormLabel>
                                                    <FormControl>
                                                        <Input {...field} placeholder="https://twitter.com/tuagencia" />
                                                    </FormControl>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={updating}>
                                    {updating ? 'Guardando...' : 'Guardar Cambios'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </TabsContent>

                <TabsContent value="verification" className="space-y-6 mt-6">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Estado de Verificación</CardTitle>
                                    <CardDescription>
                                        La verificación aumenta la confianza de los clientes en su agencia
                                    </CardDescription>
                                </div>
                                {agency?.verified ? (
                                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                        Verificada
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">No Verificada</Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {agency?.verified ? (
                                <Alert className="bg-green-50 border-green-200">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                    <AlertTitle>¡Felicidades!</AlertTitle>
                                    <AlertDescription>
                                        Su agencia ha sido verificada. Los clientes verán una insignia de verificación junto al nombre de su agencia.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                <>
                                    <Alert className={verificationStatus.eligible ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
                                        {verificationStatus.eligible ? (
                                            <CheckCircle className="h-5 w-5 text-green-600" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-amber-600" />
                                        )}
                                        <AlertTitle>
                                            {verificationStatus.eligible
                                                ? "¡Cumple con los requisitos para verificación!"
                                                : "Requisitos pendientes para verificación"}
                                        </AlertTitle>
                                        <AlertDescription>
                                            {verificationStatus.eligible
                                                ? "Su agencia cumple con todos los requisitos para ser verificada. Puede solicitar la verificación ahora."
                                                : "Para verificar su agencia, debe completar los siguientes requisitos:"}
                                        </AlertDescription>

                                        {!verificationStatus.eligible && (
                                            <ul className="mt-2 space-y-1 text-sm">
                                                {verificationStatus.reasons.map((reason, index) => (
                                                    <li key={index} className="flex items-center gap-2">
                                                        <AlertCircle className="h-4 w-4 text-amber-600" />
                                                        {reason}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </Alert>

                                    <div className="space-y-4 mt-6">
                                        <h3 className="text-lg font-medium">Requisitos para la verificación</h3>
                                        <div className="space-y-2">
                                            <div className="flex items-start gap-2">
                                                <div className={`mt-0.5 ${agency?.logo ? "text-green-600" : "text-gray-400"}`}>
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Logo de la agencia</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Sube un logo profesional que represente a tu agencia
                                                    </p>
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="flex items-start gap-2">
                                                <div className={`mt-0.5 ${agency?.website ? "text-green-600" : "text-gray-400"}`}>
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Sitio web</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Un sitio web activo y profesional para tu agencia
                                                    </p>
                                                    {agency?.website && (
                                                        <a
                                                            href={agency.website}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary flex items-center mt-1"
                                                        >
                                                            Visitar sitio <ExternalLink className="h-3 w-3 ml-1" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="flex items-start gap-2">
                                                <div className={`mt-0.5 ${agency?.socialMedia?.facebook ? "text-green-600" : "text-gray-400"}`}>
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Perfil de Facebook</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Una página de Facebook activa para tu agencia
                                                    </p>
                                                    {agency?.socialMedia?.facebook && (
                                                        <a
                                                            href={agency.socialMedia.facebook}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary flex items-center mt-1"
                                                        >
                                                            Visitar perfil <ExternalLink className="h-3 w-3 ml-1" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>

                                            <Separator />

                                            <div className="flex items-start gap-2">
                                                <div className={`mt-0.5 ${agency?.socialMedia?.instagram ? "text-green-600" : "text-gray-400"}`}>
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">Perfil de Instagram</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        Una cuenta de Instagram activa para tu agencia
                                                    </p>
                                                    {agency?.socialMedia?.instagram && (
                                                        <a
                                                            href={agency.socialMedia.instagram}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-primary flex items-center mt-1"
                                                        >
                                                            Visitar perfil <ExternalLink className="h-3 w-3 ml-1" />
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <Button
                                            onClick={handleVerification}
                                            disabled={!verificationStatus.eligible || verifying || agency?.subscriptionPlan === 'free'}
                                            className="w-full"
                                        >
                                            {verifying ? 'Procesando...' : 'Solicitar Verificación'}
                                        </Button>
                                        {
                                            agency?.subscriptionPlan === 'free' &&
                                            <div
                                                className="text-center bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mt-4">
                                                <span>La verficacion de empresa esta solo disponible en los planes basico y premium. Actualiza tu plan en <a
                                                    href="/dashboard/suscripcion"
                                                    className="underline">Planes</a>.</span>
                                            </div>
                                        }
                                        <p className="text-xs text-center text-muted-foreground mt-2">
                                            Al solicitar la verificación, aceptas que revisemos la información
                                            proporcionada.
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}