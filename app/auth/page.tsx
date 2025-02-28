"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Building2 } from "lucide-react";

export default function RegisterSelection() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
            <div className="w-full max-w-4xl px-4 py-12">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Únete a QViaje</h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Selecciona cómo quieres formar parte de nuestra comunidad de viajeros
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Globe className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Quiero Viajar</CardTitle>
                            <CardDescription className="text-base">
                                Regístrate como viajero para explorar y reservar paquetes turísticos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 text-center">
                            <ul className="text-left space-y-2 mb-8">
                                <li className="flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                    Descubre paquetes exclusivos
                                </li>
                                <li className="flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                    Comparte tus experiencias
                                </li>
                                <li className="flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                    Guarda tus destinos favoritos
                                </li>
                            </ul>
                            <Link href="/auth/users/register">
                                <Button className="w-full py-6 text-lg">Registrarme como Viajero</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
                        <CardHeader className="text-center pb-2">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Building2 className="h-8 w-8 text-primary" />
                            </div>
                            <CardTitle className="text-2xl">Quiero Publicar</CardTitle>
                            <CardDescription className="text-base">
                                Regístrate como agencia para ofrecer tus paquetes turísticos
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 text-center">
                            <ul className="text-left space-y-2 mb-8">
                                <li className="flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                    Publica tus paquetes turísticos
                                </li>
                                <li className="flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                    Gestiona reservas y consultas
                                </li>
                                <li className="flex items-center">
                                    <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                                    Accede a estadísticas detalladas
                                </li>
                            </ul>
                            <Link href="/auth/register">
                                <Button className="w-full py-6 text-lg">Registrarme como Agencia</Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="text-center mt-10">
                    <p className="text-gray-600">
                        ¿Ya tienes una cuenta? <Link href="/auth/login" className="text-primary hover:underline font-medium">Iniciar sesión</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}