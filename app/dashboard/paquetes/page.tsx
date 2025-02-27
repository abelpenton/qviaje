"use client";

import { useState, useEffect } from 'react';
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
import {Plus, Pencil, Trash, Archive, Upload, Eye} from 'lucide-react'
import Link from 'next/link';
import {useRouter} from 'next/navigation'

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter()

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        // Hacer la solicitud para obtener los paquetes de la agencia logueada
        const response = await fetch('/api/packages'); // Asegúrate de que la API esté configurada correctamente
        const data = await response.json();

        if (response.ok) {
          setPackages(data);
        } else {
          console.error('Error al obtener los paquetes:', data.error);
        }
      } catch (error) {
        console.error('Error de red:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return <p>Cargando...</p>; // Puedes agregar un spinner o algo similar
  }

  const handleStatusChange = async (packageId, newStatus) => {
    try {
      const response = await fetch(`/api/packages/${packageId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        // Actualizar el estado local para reflejar el cambio
        // @ts-ignore
        setPackages(packages.map(pkg =>
            pkg._id === packageId ? { ...pkg, status: newStatus } : pkg
        ));
      } else {
        const error = await response.json();
        console.error('Error al actualizar el estado:', error);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  const handleDelete = async (packageId) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este paquete? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const response = await fetch(`/api/packages/${packageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Eliminar el paquete de la lista local
        setPackages(packages.filter(pkg => pkg._id !== packageId));
      } else {
        const error = await response.json();
        console.error('Error al eliminar el paquete:', error);
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Paquetes Turísticos</h1>
            <p className="text-muted-foreground">Gestiona tus paquetes turísticos aquí</p>
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
                  <TableRow key={pkg._id}> {/* Usa _id si es el identificador de MongoDB */}
                    <TableCell className="font-medium">{pkg.title}</TableCell>
                    <TableCell>{pkg.destination}</TableCell>
                    <TableCell>${pkg.price}</TableCell>
                    <TableCell>{pkg.duration.days} días / {pkg.duration.nights} noches</TableCell>
                    <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${pkg.status === 'Listado' ? 'bg-green-100 text-green-800' : pkg.status === 'Creado' ? 'bg-gray-100 text-gray-800' : 'bg-red-100 text-red-800'}`}>
                    {pkg.status}
                  </span>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/paquetes/${pkg._id}`)}
                          title="Ver paquete"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/dashboard/paquetes/editar/${pkg._id}`)}
                          title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {(pkg.status === 'Creado' || pkg.status === 'Archivado') && (
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(pkg._id, 'Listado')}
                              title="Publicar"
                          >
                            <Upload className="h-4 w-4 text-green-600" />
                          </Button>
                      )}
                      {pkg.status === 'Listado' && (
                          <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleStatusChange(pkg._id, 'Archivado')}
                              title="Archivar"
                          >
                            <Archive className="h-4 w-4 text-amber-600" />
                          </Button>
                      )}
                      <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(pkg._id)}
                          title="Eliminar"
                      >
                        <Trash className="h-4 w-4 text-red-600" />
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
