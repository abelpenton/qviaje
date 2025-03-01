"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X, AlertCircle, CheckCircle, Star, Package, Users, BarChart, Shield, MessageSquare, TrendingUp, Award, Zap } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';

// Define subscription plan types
type PlanFeature = {
    name: string;
    included: boolean;
    description?: string;
    highlight?: boolean;
};

type PaymentLink = {
    monthly: string,
    annual: string
}

type Plan = {
    id: string;
    name: string;
    price: number;
    currency: string;
    description: string;
    features: PlanFeature[];
    cta: string;
    popular?: boolean;
    paymentLinks?: PaymentLink,
    icon: React.ReactNode;
};

export default function SubscriptionPage() {
    const { data: session } = useSession();
    const [agency, setAgency] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
    const router = useRouter();

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
            } catch (error) {
                console.error('Error al cargar datos:', error);
                toast.error('Error al cargar los datos de la agencia');
            } finally {
                setLoading(false);
            }
        };

        fetchAgencyData();
    }, [session]);

    // Define the subscription plans
    const plans: Plan[] = [
        {
            id: "free",
            name: "Gratis",
            price: 0,
            currency: "UYU",
            description: "Para agencias que están comenzando su presencia digital",
            features: [
                { name: "Hasta 10 paquetes", included: true, description: "Publica hasta 10 paquetes turísticos" },
                { name: "Soporte básico", included: true, description: "Soporte por email" },
                { name: "Análisis de datos básico", included: true, description: "Estadísticas básicas de visitas" },
                { name: "Verificación de empresa", included: false },
                { name: "Prioridad en búsquedas", included: false },
                { name: "Análisis de reseñas", included: false },
                { name: "Marketing digital", included: false },
            ],
            cta: agency?.subscriptionPlan === "free" ? "Plan actual" : "Actualizar plan",
            icon: <Package className="h-12 w-12 text-blue-500" />
        },
        {
            id: "basic",
            name: "Básico",
            price: billingCycle === "monthly" ? 1500 : 15000,
            currency: "UYU",
            description: "Para agencias que buscan crecer su presencia online",
            features: [
                { name: "Paquetes ilimitados", included: true, description: "Sin límite en la cantidad de paquetes", highlight: true },
                { name: "Soporte prioritario", included: true, description: "Soporte por email y chat" },
                { name: "Análisis de datos avanzado", included: true, description: "Estadísticas detalladas de visitas y conversiones" },
                { name: "Verificación de empresa", included: true, description: "Insignia de verificación para aumentar la confianza", highlight: true },
                { name: "Prioridad tipo 2 en búsquedas", included: true, description: "Mayor visibilidad en los resultados de búsqueda" },
                { name: "Análisis de reseñas", included: false },
                { name: "Marketing digital", included: false },
            ],
            cta: agency?.subscriptionPlan === "basic" ? "Plan actual" : "Actualizar plan",
            popular: true,
            paymentLinks: {
                monthly: 'https://www.mercadopago.com.uy/subscriptions/checkout?preapproval_plan_id=2c93808494f9e81b01954f16741b2bd0',
                annual: "https://www.mercadopago.com.uy/subscriptions/checkout?preapproval_plan_id=2c938084954560f5019552edaf4609aa"
            },
            icon: <Star className="h-12 w-12 text-blue-500" />
        },
        {
            id: "premium",
            name: "Premium",
            price: billingCycle === "monthly" ? 2000 : 20000,
            currency: "UYU",
            description: "Para agencias que quieren maximizar su presencia digital",
            features: [
                { name: "Paquetes ilimitados", included: true, description: "Sin límite en la cantidad de paquetes" },
                { name: "Soporte VIP", included: true, description: "Soporte prioritario por email, chat y teléfono" },
                { name: "Análisis de datos premium", included: true, description: "Estadísticas completas con informes personalizados" },
                { name: "Verificación de empresa", included: true, description: "Insignia de verificación para aumentar la confianza" },
                { name: "Prioridad tipo 3 en búsquedas", included: true, description: "Máxima visibilidad en los resultados de búsqueda", highlight: true },
                { name: "Análisis de reseñas y mejora", included: true, description: "Análisis detallado de reseñas con recomendaciones", highlight: true },
                { name: "Marketing digital en redes", included: true, description: "Promoción en nuestras redes sociales", highlight: true },
            ],
            cta: agency?.subscriptionPlan === "premium" ? "Plan actual" : "Actualizar plan",
            paymentLinks: {
                monthly: 'https://www.mercadopago.com.uy/subscriptions/checkout?preapproval_plan_id=2c938084954560f5019552f2239809af',
                annual: 'https://www.mercadopago.com.uy/subscriptions/checkout?preapproval_plan_id=2c93808494f9e81b019552f2d1442e92'
            },
            icon: <Award className="h-12 w-12 text-blue-500" />
        }
    ];

    const handleUpgrade = async (planId: string) => {
        if (planId === agency?.subscriptionPlan) {
            return;
        }

        if (planId === "free") {
            // Downgrade to free plan
            try {
                setProcessingPayment(true);

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1500));

                setCurrentPlan("free");
                toast.success("Has cambiado al plan Gratis exitosamente");
            } catch (error) {
                console.error('Error downgrading plan:', error);
                toast.error("Error al cambiar de plan. Por favor intenta nuevamente.");
            } finally {
                setProcessingPayment(false);
            }
            return;
        }

        // For paid plans, we would redirect to a payment page
        setProcessingPayment(true);

        // Simulate payment processing
        setTimeout(() => {
            setCurrentPlan(planId);
            setProcessingPayment(false);
            toast.success(`Has actualizado al plan ${planId === "basic" ? "Básico" : "Premium"} exitosamente`);
        }, 2000);
    };

    const getDiscountPercentage = () => {
        // Calculate the discount percentage for annual billing
        return 17; // Approximately 2 months free
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Planes de Suscripción</h1>
                <p className="text-muted-foreground">
                    Elige el plan que mejor se adapte a las necesidades de tu agencia
                </p>
            </div>

            {/* Current Plan Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        Tu Plan Actual
                    </CardTitle>
                    <CardDescription>
                        Resumen de tu suscripción actual
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-semibold">
                                Plan {agency?.subscriptionPlan === "free" ? "Gratis" : agency?.subscriptionPlan === "basic" ? "Básico" : "Premium"}
                            </h3>
                            {agency?.subscriptionPlan !== "free" && (
                                <p className="text-sm text-muted-foreground">
                                    Facturación {billingCycle === "monthly" ? "mensual" : "anual"} • Próximo pago: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {agency?.subscriptionPlan !== "free" && (
                                <Button
                                    variant="outline"
                                    onClick={() => handleUpgrade("free")}
                                    disabled={processingPayment}
                                >
                                    Cancelar suscripción
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
                <Tabs
                    defaultValue="monthly"
                    value={billingCycle}
                    onValueChange={(value) => setBillingCycle(value as "monthly" | "annual")}
                    className="w-[400px]"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="monthly">Facturación Mensual</TabsTrigger>
                        <TabsTrigger value="annual">
                            Facturación Anual
                            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                                -{getDiscountPercentage()}%
                            </Badge>
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Plan Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <Card key={plan.id} className={`relative ${plan.popular ? 'border-primary shadow-md' : ''}`}>
                        {plan.popular && (
                            <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                                <Badge className="bg-primary text-white">Más popular</Badge>
                            </div>
                        )}
                        <CardHeader>
                            <div className="flex justify-center mb-4">
                                {plan.icon}
                            </div>
                            <CardTitle className="text-center">{plan.name}</CardTitle>
                            <div className="text-center">
                                <span className="text-3xl font-bold">{plan.price.toLocaleString()}</span>
                                <span className="text-muted-foreground ml-1">{plan.price > 0 ? `${plan.currency}/${billingCycle === "monthly" ? "mes" : "año"}` : ""}</span>
                            </div>
                            <CardDescription className="text-center">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <ul className="space-y-3">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        {feature.included ? (
                                            <Check className={`h-5 w-5 mt-0.5 ${feature.highlight ? 'text-primary' : 'text-green-500'}`} />
                                        ) : (
                                            <X className="h-5 w-5 mt-0.5 text-muted-foreground" />
                                        )}
                                        <div>
                                            <span className={`${feature.highlight ? 'font-medium text-primary' : ''}`}>{feature.name}</span>
                                            {feature.description && (
                                                <p className="text-xs text-muted-foreground">{feature.description}</p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={agency?.subscriptionPlan === plan.id ? "outline" : plan.popular ? "default" : "outline"}
                                disabled={agency?.subscriptionPlan === plan.id || processingPayment}
                                onClick={() => {
                                    //handleUpgrade(plan.id)
                                    const links = plan.paymentLinks
                                    window.open(billingCycle === "monthly" ? links?.monthly : links?.annual, "_blank");
                                }}
                            >
                                {processingPayment && agency?.subscriptionPlan !== plan.id ? "Procesando..." : plan.cta}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            {/* Feature Comparison */}
            <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Comparación detallada de características</CardTitle>
                    <CardDescription>
                        Explora todas las características disponibles en cada plan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="border-b">
                                <th className="text-left py-4 px-4">Característica</th>
                                <th className="text-center py-4 px-4">Gratis</th>
                                <th className="text-center py-4 px-4">Básico</th>
                                <th className="text-center py-4 px-4">Premium</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="border-b">
                                <td className="py-4 px-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Package className="h-5 w-5 text-muted-foreground" />
                                        Paquetes turísticos
                                    </div>
                                </td>
                                <td className="text-center py-4 px-4">Hasta 10</td>
                                <td className="text-center py-4 px-4">Ilimitados</td>
                                <td className="text-center py-4 px-4">Ilimitados</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-4 px-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Shield className="h-5 w-5 text-muted-foreground" />
                                        Verificación de empresa
                                    </div>
                                </td>
                                <td className="text-center py-4 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                                <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                                <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-4 px-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                        Soporte
                                    </div>
                                </td>
                                <td className="text-center py-4 px-4">Email</td>
                                <td className="text-center py-4 px-4">Email y chat</td>
                                <td className="text-center py-4 px-4">Email, chat y teléfono</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-4 px-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <BarChart className="h-5 w-5 text-muted-foreground" />
                                        Análisis de datos
                                    </div>
                                </td>
                                <td className="text-center py-4 px-4">Básico</td>
                                <td className="text-center py-4 px-4">Avanzado</td>
                                <td className="text-center py-4 px-4">Premium con informes</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-4 px-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                        Prioridad en búsquedas
                                    </div>
                                </td>
                                <td className="text-center py-4 px-4">Estándar</td>
                                <td className="text-center py-4 px-4">Prioridad tipo 2</td>
                                <td className="text-center py-4 px-4">Prioridad tipo 3 (máxima)</td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-4 px-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-5 w-5 text-muted-foreground" />
                                        Análisis de reseñas
                                    </div>
                                </td>
                                <td className="text-center py-4 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                                <td className="text-center py-4 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                                <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b">
                                <td className="py-4 px-4 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 text-muted-foreground" />
                                        Marketing digital
                                    </div>
                                </td>
                                <td className="text-center py-4 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                                <td className="text-center py-4 px-4"><X className="h-5 w-5 text-muted-foreground mx-auto" /></td>
                                <td className="text-center py-4 px-4"><Check className="h-5 w-5 text-green-500 mx-auto" /></td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Need Help Section */}
            <Alert className="bg-muted">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    ¿Necesitas ayuda para elegir el plan adecuado? <a href="/contacto" className="font-medium text-primary hover:underline">Contacta con nuestro equipo</a> y te asesoraremos según las necesidades específicas de tu agencia.
                </AlertDescription>
            </Alert>
        </div>
    );
}