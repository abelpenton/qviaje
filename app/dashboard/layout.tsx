"use client";

import { useSession } from 'next-auth/react';
import {redirect, useRouter} from 'next/navigation'
import {useEffect, useState} from 'react'
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Package,
  Settings,
  ChevronRight,
  Menu, CreditCard
} from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = useSession();
  const router = useRouter()
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!session || (session && session?.data?.user.type !== 'agency')) {
      router.push('/auth/login');
    }
  }, [session])


  if (session.status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (session.status === 'unauthenticated') {
    router.push('/auth/login');
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Paquetes',
      href: '/dashboard/paquetes',
      icon: Package,
    },
    //{ name: "Suscripción", href: "/dashboard/suscripcion", icon: CreditCard },
    {
      name: 'Configuración',
      href: '/dashboard/configuracion',
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside
        className={`bg-gray-900 text-white ${
          isCollapsed ? 'w-16' : 'w-64'
        } transition-all duration-300 ease-in-out flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {!isCollapsed && <span className="font-bold text-lg">QViaje</span>}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="text-white hover:bg-gray-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 p-2 space-y-1">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              <item.icon className="h-5 w-5" />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-50">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}