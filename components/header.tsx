"use client";

import { useState } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Plane } from "lucide-react";
import {redirect, useRouter} from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession(); // Get session
  const router = useRouter()

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

              {session ? (
                  // If logged in, show name & logout
                  <div className="flex items-center space-x-4">
                    <span className="text-foreground">{session.user?.name}</span>
                    <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
                      Mi Perfil
                    </Button>
                    <Button variant="outline" onClick={() => signOut()}>
                      Cerrar Sesión
                    </Button>
                  </div>
              ) : (
                  // If not logged in, show login/register
                  <>
                    <Link href="/auth/login">
                      <Button variant="outline">Iniciar Sesión</Button>
                    </Link>
                    <Link href="/auth/register">
                      <Button>Registrarse</Button>
                    </Link>
                  </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
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
                <Link href="/explorar" className="block py-2 text-foreground hover:text-primary">
                  Explorar
                </Link>
                <Link href="/agencias" className="block py-2 text-foreground hover:text-primary">
                  Agencias
                </Link>

                {session ? (
                    // If logged in, show name & logout
                    <div className="space-y-2 text-center">
                      <p className="text-foreground">{session.user?.name}</p>
                      <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard")}>
                        Mi Perfil
                      </Button>
                      <Button variant="outline" className="w-full" onClick={() => signOut()}>
                        Cerrar Sesión
                      </Button>
                    </div>
                ) : (
                    // If not logged in, show login/register
                    <div className="space-y-2">
                      <Link href="/auth/login">
                        <Button variant="outline" className="w-full">
                          Iniciar Sesión
                        </Button>
                      </Link>
                      <Link href="/auth/register">
                        <Button className="w-full">Registrarse</Button>
                      </Link>
                    </div>
                )}
              </div>
          )}
        </nav>
      </header>
  );
}