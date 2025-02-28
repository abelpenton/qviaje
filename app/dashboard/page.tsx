//@ts-nocheck
"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Package,
  Eye,
  MessageSquare,
  TrendingUp,
  Calendar,
  Users,
  BarChart4,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useRouter } from 'next/navigation';

// Registrar componentes de Chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activePackages: 0,
    totalPackages: 0,
    weeklyViews: 0,
    weeklyInquiries: 0,
    viewsChange: 0,
    inquiriesChange: 0,
    dailyStats: [],
    topPackages: [],
  });
  const [period, setPeriod] = useState('week');
  const router = useRouter();

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!session?.user?.id) return;

      try {
        setLoading(true);
        const response = await fetch(`/api/statistics?period=${period}`);

        if (!response.ok) {
          throw new Error('Error al cargar estadísticas');
        }

        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [session, period]);

  // Preparar datos para el gráfico de líneas (vistas y consultas diarias)
  const lineChartData = {
    labels: stats.dailyStats.map(day => format(new Date(day.date), 'EEE d', { locale: es })),
    datasets: [
      {
        label: 'Vistas',
        data: stats.dailyStats.map(day => day.views),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
      {
        label: 'Consultas',
        data: stats.dailyStats.map(day => day.inquiries),
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.5)',
        tension: 0.3,
      },
    ],
  };

  // Preparar datos para el gráfico de barras (paquetes más vistos)
  const barChartData = {
    labels: stats.topPackages.map(pkg => pkg.title.length > 15 ? pkg.title.substring(0, 15) + '...' : pkg.title),
    datasets: [
      {
        label: 'Vistas',
        data: stats.topPackages.map(pkg => pkg.views),
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
        },
      },
    },
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Cargando estadísticas...</div>;
  }

  return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Bienvenido de nuevo. Aquí tienes un resumen de tu actividad.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
                variant={period === 'week' ? 'default' : 'outline'}
                onClick={() => setPeriod('week')}
            >
              Semana
            </Button>
            <Button
                variant={period === 'month' ? 'default' : 'outline'}
                onClick={() => setPeriod('month')}
            >
              Mes
            </Button>
          </div>
        </div>

        {/* Tarjetas de estadísticas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Paquetes Activos
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePackages}</div>
              <p className="text-xs text-muted-foreground">
                de {stats.totalPackages} paquetes totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vistas esta {period === 'week' ? 'semana' : 'mes'}
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weeklyViews}</div>
              <div className="flex items-center text-xs">
                {stats.viewsChange > 0 ? (
                    <>
                      <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500">{stats.viewsChange}% más</span>
                    </>
                ) : stats.viewsChange < 0 ? (
                    <>
                      <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500">{Math.abs(stats.viewsChange)}% menos</span>
                    </>
                ) : (
                    <span className="text-muted-foreground">Sin cambios</span>
                )}
                <span className="text-muted-foreground ml-1">
                vs. {period === 'week' ? 'semana' : 'mes'} anterior
              </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Consultas esta {period === 'week' ? 'semana' : 'mes'}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.weeklyInquiries}</div>
              <div className="flex items-center text-xs">
                {stats.inquiriesChange > 0 ? (
                    <>
                      <ArrowUpRight className="mr-1 h-4 w-4 text-green-500" />
                      <span className="text-green-500">{stats.inquiriesChange}% más</span>
                    </>
                ) : stats.inquiriesChange < 0 ? (
                    <>
                      <ArrowDownRight className="mr-1 h-4 w-4 text-red-500" />
                      <span className="text-red-500">{Math.abs(stats.inquiriesChange)}% menos</span>
                    </>
                ) : (
                    <span className="text-muted-foreground">Sin cambios</span>
                )}
                <span className="text-muted-foreground ml-1">
                vs. {period === 'week' ? 'semana' : 'mes'} anterior
              </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tasa de Conversión
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.weeklyViews > 0
                    ? Math.round((stats.weeklyInquiries / stats.weeklyViews) * 100)
                    : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Consultas / Vistas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Actividad Diaria</CardTitle>
              <CardDescription>
                Vistas y consultas diarias durante el {period === 'week' ? 'última semana' : 'último mes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Line data={lineChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-1">
            <CardHeader>
              <CardTitle>Paquetes Más Populares</CardTitle>
              <CardDescription>
                Los paquetes más vistos durante el {period === 'week' ? 'última semana' : 'último mes'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <Bar data={barChartData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de paquetes más populares */}
        <Card>
          <CardHeader>
            <CardTitle>Detalle de Paquetes Populares</CardTitle>
            <CardDescription>
              Estadísticas detalladas de tus paquetes más visitados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium">Paquete</th>
                  <th className="py-3 text-center font-medium">Vistas</th>
                  <th className="py-3 text-center font-medium">Consultas</th>
                  <th className="py-3 text-center font-medium">Conversión</th>
                  <th className="py-3 text-center font-medium">Estado</th>
                  <th className="py-3 text-right font-medium">Acciones</th>
                </tr>
                </thead>
                <tbody>
                {stats.topPackages.map((pkg) => (
                    <tr key={pkg.id} className="border-b">
                      <td className="py-3">{pkg.title}</td>
                      <td className="py-3 text-center">{pkg.views}</td>
                      <td className="py-3 text-center">{pkg.inquiries}</td>
                      <td className="py-3 text-center">
                        {pkg.views > 0 ? Math.round((pkg.inquiries / pkg.views) * 100) : 0}%
                      </td>
                      <td className="py-3 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          pkg.status === 'Listado' ? 'bg-green-100 text-green-800' :
                              pkg.status === 'Creado' ? 'bg-gray-100 text-gray-800' :
                                  'bg-red-100 text-red-800'}`}>
                        {pkg.status}
                      </span>
                      </td>
                      <td className="py-3 text-right">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/paquetes/editar/${pkg.id}`)}
                        >
                          Ver detalles
                        </Button>
                      </td>
                    </tr>
                ))}
                {stats.topPackages.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-muted-foreground">
                        No hay datos disponibles para el período seleccionado
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
  );
}