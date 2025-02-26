"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Plus, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';

export default function PackagesPage() {
  const [packages] = useState([
    {
      id: 1,
      title: 'Aventura en Machu Picchu',
      destination: 'Cusco, Perú',
      price: 1499,
      duration: '5 días',
      status: 'active',
    },
    {
      id: 2,
      title: 'Playas del Caribe',
      destination: 'Punta Cana',
      price: 1899,
      duration: '7 días',
      status: 'active',
    },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paquetes Turísticos</h1>
          <p className="text-muted-foreground">
            Gestiona tus paquetes turísticos aquí
          </p>
        </div>
        <Link href="/dashboard/paquetes/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paquete
          </Button>
        </Link>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Destino</TableHead>
              <TableHead>Precio</TableHead>
              <TableHead>Duración</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packages.map((pkg) => (
              <TableRow key={pkg.id}>
                <TableCell className="font-medium">{pkg.title}</TableCell>
                <TableCell>{pkg.destination}</TableCell>
                <TableCell>${pkg.price}</TableCell>
                <TableCell>{pkg.duration}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Activo
                  </span>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}