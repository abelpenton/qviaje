"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MapPin, Search, Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function NotFound() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-2xl mx-auto"
            >
                <div className="relative w-48 h-48 mx-auto mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                        className="absolute inset-0 flex items-center justify-center"
                    >
                        <div className="text-9xl font-bold text-primary/20">404</div>
                    </motion.div>
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5, duration: 0.5 }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                    >
                        <MapPin className="h-24 w-24 text-primary" />
                    </motion.div>
                </div>

                <motion.h1
                    className="text-4xl font-bold mb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    ¡Destino no encontrado!
                </motion.h1>

                <motion.p
                    className="text-xl text-muted-foreground mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                >
                    Parece que te has perdido en tu viaje. La página que buscas no existe o ha sido movida a otro destino.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row gap-4 justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <Link href="/">
                        <Button size="lg" className="gap-2">
                            <Home className="h-4 w-4" />
                            Volver al inicio
                        </Button>
                    </Link>

                    <Link href="/explorar">
                        <Button variant="outline" size="lg" className="gap-2">
                            <Search className="h-4 w-4" />
                            Explorar paquetes
                        </Button>
                    </Link>

                    <Button variant="ghost" size="lg" className="gap-2" onClick={() => window.history.back()}>
                        <ArrowLeft className="h-4 w-4" />
                        Regresar
                    </Button>
                </motion.div>

                <motion.div
                    className="mt-12 p-6 bg-muted rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                >
                    <h2 className="text-lg font-medium mb-4">¿Buscabas algo en específico?</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/explorar" className="text-primary hover:underline">Explorar paquetes turísticos</Link>
                        <Link href="/agencias" className="text-primary hover:underline">Ver agencias verificadas</Link>
                        <Link href="/preguntas-frecuentes" className="text-primary hover:underline">Preguntas frecuentes</Link>
                        <Link href="/contacto" className="text-primary hover:underline">Contactar con soporte</Link>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}