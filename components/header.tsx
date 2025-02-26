"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Menu, X, Plane } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="border-b">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Plane className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">QViaje</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="relative">
              <Input
                type="search"
                placeholder="Buscar destinos..."
                className="w-64 pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <Link href="/explorar" className="text-foreground hover:text-primary">
              Paquetes
            </Link>
            <Link href="/agencias" className="text-foreground hover:text-primary">
              Agencias
            </Link>
            <Link href="/auth/login">
              <Button variant="outline">Iniciar Sesión</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Registrarse</Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-4">
            <div className="relative">
              <Input
                type="search"
                placeholder="Buscar destinos..."
                className="w-full pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
            <Link
              href="/explorar"
              className="block py-2 text-foreground hover:text-primary"
            >
              Explorar
            </Link>
            <Link
              href="/agencias"
              className="block py-2 text-foreground hover:text-primary"
            >
              Agencias
            </Link>
            <div className="space-y-2">
              <Link href="/auth/login" className="block">
                <Button variant="outline" className="w-full">
                  Iniciar Sesión
                </Button>
              </Link>
              <Link href="/auth/register" className="block">
                <Button className="w-full">Registrarse</Button>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}