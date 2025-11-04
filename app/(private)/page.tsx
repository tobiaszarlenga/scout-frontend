"use client";

import { useDashboard } from 'hooks/useDashboard';
import Link from 'next/link'; // <--- CAMBIO 1: Importamos Link
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  ChartPieIcon, ChartBarIcon, CalendarDaysIcon, 
  UsersIcon, UserGroupIcon, CalendarIcon 
} from '@heroicons/react/24/solid';

// Colores para el gráfico de torta
const PIE_COLORS: { [key: string]: string } = {
  'PROGRAMADO': '#3B82F6',
  'FINALIZADO': '#16A34A',
};

export default function InicioPage() {
  const { query } = useDashboard();

  // 1. Manejo de Carga
  if (query.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#90D1F2] to-[#012F8A]">
        <p className="text-2xl font-bold text-white">Cargando tu dashboard...</p>
      </div>
    );
  }

  // 2. Manejo de Error
  if (query.isError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#90D1F2] to-[#012F8A]">
        <p className="text-2xl font-bold text-red-400">Error: {(query.error as Error).message}</p>
      </div>
    );
  }

  // 3. Si no hay datos
  if (!query.data) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#90D1F2] to-[#012F8A]">
        <p className="text-2xl font-bold text-white">No se encontraron datos.</p>
      </div>
    );
  }

  // 4. Datos listos para usar
  const { kpis, graficoTorta, graficoBarras, proximosPartidos } = query.data;

  return (
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 font-sans sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-7xl">
        
        <header className="flex items-center justify-between pb-8">
          <h1 className="text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Inicio
          </h1>
        </header>

        {/* --- SECCIÓN 1: Tarjetas de KPIs --- */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          
          {/* CAMBIO 2: Envuelto en Link y clases de hover añadidas */}
          <Link href="/equipos">
            <div className="rounded-xl bg-white/90 p-5 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white cursor-pointer">
              <div className="flex items-center">
                <div className="rounded-full bg-sky-100 p-3">
                  <UsersIcon className="h-6 w-6 text-sky-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-700">Mis Equipos</h3>
              </div>
              <p className="mt-4 text-5xl font-bold text-gray-900">{kpis.equipos}</p>
            </div>
          </Link>

          {/* CAMBIO 3: Envuelto en Link y clases de hover añadidas */}
          <Link href="/pitchers">
            <div className="rounded-xl bg-white/90 p-5 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white cursor-pointer">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3">
                  <UserGroupIcon className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-700">Mis Pitchers</h3>
              </div>
              <p className="mt-4 text-5xl font-bold text-gray-900">{kpis.pitchers}</p>
            </div>
          </Link>

          {/* CAMBIO 4: Envuelto en Link y clases de hover añadidas */}
          <Link href="/partidos">
            <div className="rounded-xl bg-white/90 p-5 shadow-xl backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:bg-white cursor-pointer">
              <div className="flex items-center">
                <div className="rounded-full bg-indigo-100 p-3">
                  <CalendarIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="ml-3 text-lg font-semibold text-gray-700">Mis Partidos</h3>
              </div>
              <p className="mt-4 text-5xl font-bold text-gray-900">{kpis.partidos}</p>
            </div>
          </Link>

        </div>

        {/* --- SECCIÓN 2: Gráficos --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          
          {/* Gráfico de Torta */}
          <div className="rounded-xl bg-white/90 p-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <ChartPieIcon className="h-6 w-6 mr-2 text-gray-600" />
              Estado de tus Partidos
            </h3>
            {graficoTorta.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={graficoTorta as any[]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {graficoTorta.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[entry.name.toUpperCase()] || '#8884d8'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-center h-[300px] flex items-center justify-center">No hay datos de partidos para mostrar.</p>
            )}
          </div>
          
          {/* Gráfico de Barras */}
          <div className="rounded-xl bg-white/90 p-6 shadow-xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-2 text-gray-600" />
              Pitchers por Equipo
            </h3>
            {graficoBarras.length > 0 ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={graficoBarras} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pitchers" name="Pitchers" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-500 text-center h-[300px] flex items-center justify-center">No tienes equipos o pitchers para mostrar.</p>
            )}
          </div>
        </div>

        {/* --- SECCIÓN 3: Próximos Partidos --- */}
        <div className="rounded-xl bg-white/90 p-6 shadow-xl backdrop-blur-sm">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <CalendarDaysIcon className="h-6 w-6 mr-2 text-gray-600" />
            Tus Próximos Partidos Programados
          </h3>
          {proximosPartidos.length > 0 ? (
            <ul className="space-y-4">
              {proximosPartidos.map(partido => (
                <li key={partido.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200 flex flex-col sm:flex-row justify-between sm:items-center">
                  <div>
                    <div className="font-bold text-lg text-gray-800">
                      {partido.equipoLocal} vs {partido.equipoVisitante}
                    </div>
                  </div>
                  <div className="text-md font-semibold text-gray-700 text-left sm:text-right mt-2 sm:mt-0">
                    {format(new Date(partido.fecha), "eeee dd/MM · HH:mm 'hs'", { locale: es })}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-center py-8">No tienes partidos programados.</p>
          )}
        </div>

      </div>
    </main>
  );
}