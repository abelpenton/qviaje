import Link from 'next/link';
import { Plane } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Plane className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">QViaje</span>
            </div>
            <p className="text-muted-foreground">
              Encuentra los mejores paquetes turísticos de agencias verificadas en Latinoamérica.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Para Viajeros</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/explorar" className="text-muted-foreground hover:text-primary">
                  Explorar Paquetes
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-muted-foreground hover:text-primary">
                  Mis Favoritos
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-muted-foreground hover:text-primary">
                  Cómo Funciona
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Para Agencias</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/auth/register" className="text-muted-foreground hover:text-primary">
                  Registrar Agencia
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
                  Analisis De Ventas
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-muted-foreground hover:text-primary">
                  Cómo Funciona
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contacto" className="text-muted-foreground hover:text-primary">
                  Contacto
                </Link>
              </li>
              <li>
                <Link href="/preguntas-frecuentes" className="text-muted-foreground hover:text-primary">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link href="/terminos-condiciones" className="text-muted-foreground hover:text-primary">
                  Términos y Condiciones
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} QViaje. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}