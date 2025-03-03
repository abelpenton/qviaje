//@ts-nocheck
"use client";

import {useRef, useState} from 'react'
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Menu, X, Plane } from "lucide-react";
import {useRouter} from 'next/navigation'
import favicon from "/public/favicon.ico";
import Image from "next/image";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession(); // Get session

  const router = useRouter()
  const selectRef = useRef(null);

  const [query, setQuery] = useState("");

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && query.trim() !== "") {
      router.push(`/explorar?destination=${encodeURIComponent(query)}`);
    }
  };

  return (
      <header className="border-b">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap" rel="stylesheet"/>
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Plane className="h-6 w-6 text-primary"/>
              <span className="text-xl font-bold">QViaje</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <div className="relative">
                <Input
                    type="search"
                    placeholder="Buscar destinos..."
                    className="w-64 pl-10"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyPress}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"/>
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
                    <Button variant="outline" className="w-full" onClick={() => {
                      if (session.user.type === 'agency') {
                        return router.push('/dashboard')
                      }

                      return router.push('/profile')
                    }}>
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
                    <Link href="/auth">
                      <Button>Registrarse</Button>
                    </Link>
                  </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6"/> : <Menu className="h-6 w-6"/>}
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
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyPress}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground"/>
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
                      <Button variant="outline" className="w-full" onClick={() => {
                        if (session.user.type === 'agency') {
                          return router.push("/dashboard");
                        }

                        return router.push("/profile");
                      }}>
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
                      <Link href="/auth">
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