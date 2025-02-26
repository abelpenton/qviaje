"use client";

import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import {
  Package,
  Users,
  TrendingUp,
  Calendar,
} from 'lucide-react';

export default function DashboardPage() {
  const session = useSession();

  const stats = [
    {
      name: 'Paquetes Activos',
      value: '12',
      icon: Package,
      change: '+2.5%',
      changeType: 'positive',
    },
    {
      name: 'Reservas Totales',
      value: '48',
      icon: Users,
      change: '+18.1%',
      changeType: 'positive',
    },
    {
      name: 'Ingresos Mensuales',
      value: '$12,450',
      icon: TrendingUp,
      change: '+4.75%',
      changeType: 'positive',
    },
    {
      name: 'Próximas Salidas',
      value: '8',
      icon: Calendar,
      change: '0%',
      changeType: 'neutral',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Bienvenido, {session?.data?.user?.name}
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de tu actividad reciente
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary/10 rounded-full">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </p>
                <h2 className="text-2xl font-bold">{stat.value}</h2>
                <p
                  className={`text-sm ${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : stat.changeType === 'negative'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {stat.change}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Actividad Reciente</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-full">
              <Package className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="font-medium">Nuevo paquete creado</p>
              <p className="text-sm text-muted-foreground">
                "Aventura en Machu Picchu" - hace 2 horas
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-full">
              <Users className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Nueva reserva recibida</p>
              <p className="text-sm text-muted-foreground">
                Paquete "Playas del Caribe" - hace 5 horas
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}