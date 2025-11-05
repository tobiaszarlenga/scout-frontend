"use client";

import { useDashboard } from 'hooks/useDashboard';
import Link from 'next/link';
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

// 🎨 SoftScout Dark Edition (ajustada)
const COLORS = {
  dark: '#15202B',   // fondo principal más claro
  accent: '#c54c18ff', // naranja más oscuro
  card: '#22313F',   // tarjetas
  text: '#DDE2E5'    // textos
};

type PieChartData = { name: string; value: number };

const PIE_COLORS: Record<string, string> = {
  PROGRAMADO: COLORS.accent,
  FINALIZADO: '#3993a9ff',
};

export default function InicioPage() {
  const { query } = useDashboard();

  // Pantallas de carga / error / vacío
  const Bg = ({ children }: { children: React.ReactNode }) => (
    <div className="flex h-screen items-center justify-center"
         style={{ background: `linear-gradient(150deg, #1F2F40, #15202B)` }}>
      {children}
    </div>
  );

  if (query.isLoading) return <Bg><p className="text-2xl font-bold text-white">Cargando tu dashboard...</p></Bg>;
  if (query.isError) return <Bg><p className="text-2xl font-bold text-red-400">Error: {(query.error as Error).message}</p></Bg>;
  if (!query.data) return <Bg><p className="text-2xl font-bold text-white">No se encontraron datos.</p></Bg>;

  const { kpis, graficoTorta, graficoBarras, proximosPartidos } = query.data;

  return (
    <main
      className="min-h-full w-full max-w-full overflow-x-hidden px-6 py-6 font-sans sm:px-10 sm:py-8"
      style={{ background: `linear-gradient(150deg, #1F2F40, #15202B)` }}
    >
      <div className="mx-auto w-full max-w-7xl">
        <header className="flex items-center justify-between pb-8">
          <h1 className="text-4xl font-bold" style={{ color: COLORS.text }}>
            Inicio
          </h1>
        </header>

        {/* --- SECCIÓN 1: Tarjetas KPI --- */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          {[ 
            { href: "/equipos", label: "Mis Equipos", icon: <UsersIcon className="h-6 w-6" /> , value: kpis.equipos },
            { href: "/pitchers", label: "Mis Pitchers", icon: <UserGroupIcon className="h-6 w-6" />, value: kpis.pitchers },
            { href: "/partidos", label: "Mis Partidos", icon: <CalendarIcon className="h-6 w-6" />, value: kpis.partidos }
          ].map((item, i) => (
            <Link key={i} href={item.href}>
              <div className="rounded-xl p-5 shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                   style={{ backgroundColor: COLORS.card }}>
                <div className="flex items-center">
                  <div className="rounded-full p-3" style={{ backgroundColor: COLORS.accent }}>
                    {item.icon}
                  </div>
                  <h3 className="ml-3 text-lg font-semibold" style={{ color: COLORS.text }}>
                    {item.label}
                  </h3>
                </div>
                <p className="mt-4 text-5xl font-bold" style={{ color: COLORS.text }}>{item.value}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* --- SECCIÓN 2: Gráficos --- */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          <div className="rounded-xl p-6 shadow-xl" style={{ backgroundColor: COLORS.card }}>
            <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: COLORS.text }}>
              <ChartPieIcon className="h-6 w-6 mr-2" style={{ color: COLORS.accent }} />
              Estado de Partidos
            </h3>
            {graficoTorta?.length ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={graficoTorta as PieChartData[]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {graficoTorta.map((e, i) => (
                        <Cell key={i} fill={PIE_COLORS[e.name.toUpperCase()] || COLORS.accent} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-400 text-center h-[300px] flex items-center justify-center">
                No hay datos de partidos para mostrar.
              </p>
            )}
          </div>

          <div className="rounded-xl p-6 shadow-xl" style={{ backgroundColor: COLORS.card }}>
            <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: COLORS.text }}>
              <ChartBarIcon className="h-6 w-6 mr-2" style={{ color: COLORS.accent }} />
              Pitchers por Equipo
            </h3>
            {graficoBarras.length ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={graficoBarras} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3a4959" />
                    <XAxis dataKey="name" fontSize={12} stroke="#A0AAB2" />
                    <YAxis allowDecimals={false} stroke="#A0AAB2" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pitchers" name="Pitchers" fill={COLORS.accent} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-gray-400 text-center h-[300px] flex items-center justify-center">
                No tienes equipos o pitchers para mostrar.
              </p>
            )}
          </div>
        </div>

        {/* --- SECCIÓN 3: Próximos Partidos --- */}
        <div className="rounded-xl p-6 shadow-xl" style={{ backgroundColor: COLORS.card }}>
          <h3 className="text-xl font-bold mb-4 flex items-center" style={{ color: COLORS.text }}>
            <CalendarDaysIcon className="h-6 w-6 mr-2" style={{ color: COLORS.accent }} />
            Tus Próximos Partidos Programados
          </h3>
          {proximosPartidos.length ? (
            <ul className="space-y-4">
              {proximosPartidos.map((p: any) => (
                <li key={p.id} className="p-4 rounded-lg flex flex-col sm:flex-row justify-between sm:items-center"
                    style={{ backgroundColor: '#1F2F40' }}>
                  <div>
                    <div className="font-bold text-lg" style={{ color: COLORS.text }}>
                      {p.equipoLocal} vs {p.equipoVisitante}
                    </div>
                  </div>
                  <div className="text-md font-semibold" style={{ color: COLORS.text }}>
                    {format(new Date(p.fecha), "eeee dd/MM · HH:mm 'hs'", { locale: es })}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center py-8">No tienes partidos programados.</p>
          )}
        </div>
      </div>
    </main>
  );
}
