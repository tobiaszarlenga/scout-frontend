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

/** 🎨 Paleta más profesional (sobria) */
const COLORS = {
  bgGradFrom: '#0f1a26',
  bgGradTo:   '#0b1220',
  surface:    '#101826',       // fondo de tarjetas
  surfaceAlt: '#0d1522',       // listas/alternativo
  border:     'rgba(255,255,255,0.06)',
  text:       '#e5e7eb',       // texto principal
  muted:      '#9aa7b1',       // texto secundario
  accent:     '#ff7a1a',       // naranja menos saturado
  accentAlt:  '#3FA4B7'        // apoyo para gráficos
};

type PieChartData = { name: string; value: number };

const PIE_COLORS: Record<string, string> = {
  PROGRAMADO: COLORS.accent,
  FINALIZADO: COLORS.accentAlt,
};

/** Tooltip “oscuro” para Recharts */
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div
      style={{
        background: '#0b0f16',
        border: `1px solid ${COLORS.border}`,
        padding: '8px 10px',
        borderRadius: 8,
        color: COLORS.text,
        fontSize: 12
      }}
    >
      <div style={{ opacity: .8, marginBottom: 4 }}>{label}</div>
      <div><b>{p.name ?? p.dataKey}</b>: {p.value}</div>
    </div>
  );
};

export default function InicioPage() {
  const { query } = useDashboard();

  const Bg = ({ children }: { children: React.ReactNode }) => (
    <div
      className="flex min-h-screen items-center justify-center"
      style={{ background: `linear-gradient(160deg, ${COLORS.bgGradFrom}, ${COLORS.bgGradTo})` }}
    >
      {children}
    </div>
  );

  if (query.isLoading) return <Bg><p className="text-xl font-semibold" style={{ color: COLORS.text }}>Cargando tu dashboard…</p></Bg>;
  if (query.isError)   return <Bg><p className="text-xl font-semibold text-red-400">Error: {(query.error as Error).message}</p></Bg>;
  if (!query.data)     return <Bg><p className="text-xl font-semibold" style={{ color: COLORS.text }}>No se encontraron datos.</p></Bg>;

  const { kpis, graficoTorta, graficoBarras, proximosPartidos } = query.data;

  return (
    <main
      className="min-h-full w-full max-w-full overflow-x-hidden px-6 py-6 sm:px-10 sm:py-8"
      style={{ background: `linear-gradient(160deg, ${COLORS.bgGradFrom}, ${COLORS.bgGradTo})` }}
    >
      <div className="mx-auto w-full max-w-7xl">
        {/* Header más limpio */}
        <header className="pb-6">
          <div className="flex items-end justify-between">
            <h1 className="text-3xl font-semibold tracking-tight" style={{ color: COLORS.text }}>Inicio</h1>
          </div>
          <div className="mt-3 h-px w-full" style={{ background: COLORS.border }} />
        </header>

        {/* KPIs más elegantes: texto primero, número protagonista, hover sutil */}
        <div className="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { href: "/equipos",   label: "Mis Equipos",  icon: <UsersIcon className="h-5 w-5" />,     value: kpis.equipos },
            { href: "/pitchers",  label: "Mis Pitchers", icon: <UserGroupIcon className="h-5 w-5" />, value: kpis.pitchers },
            { href: "/partidos",  label: "Mis Partidos", icon: <CalendarIcon className="h-5 w-5" />,  value: kpis.partidos }
          ].map((item, i) => (
            <Link key={i} href={item.href}>
              <div
                className="rounded-2xl p-5 transition-all"
                style={{
                  background: COLORS.surface,
                  border: `1px solid ${COLORS.border}`,
                  boxShadow: '0 6px 20px rgba(0,0,0,.25)'
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-flex items-center justify-center rounded-xl p-2"
                    style={{ background: 'rgba(255,122,26,0.12)', color: COLORS.accent }}
                  >
                    {item.icon}
                  </span>
                  <span className="text-sm" style={{ color: COLORS.muted }}>{item.label}</span>
                </div>
                <div className="mt-2 text-5xl font-semibold leading-none" style={{ color: COLORS.text }}>
                  {item.value}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Gráficos con tema oscuro pulido */}
        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div
            className="rounded-2xl p-6"
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <h3 className="mb-4 flex items-center text-base font-semibold" style={{ color: COLORS.text }}>
              <ChartPieIcon className="mr-2 h-5 w-5" style={{ color: COLORS.accent }} />
              Estado de Partidos
            </h3>

            {graficoTorta?.length ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={graficoTorta as PieChartData[]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={2}
                    >
                      {graficoTorta.map((e: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[e.name.toUpperCase()] || COLORS.accent} />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                    <Legend
                      wrapperStyle={{ color: COLORS.muted, fontSize: 12 }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="flex h-[300px] items-center justify-center text-center" style={{ color: COLORS.muted }}>
                No hay datos de partidos para mostrar.
              </p>
            )}
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
          >
            <h3 className="mb-4 flex items-center text-base font-semibold" style={{ color: COLORS.text }}>
              <ChartBarIcon className="mr-2 h-5 w-5" style={{ color: COLORS.accent }} />
              Pitchers por Equipo
            </h3>

            {graficoBarras.length ? (
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={graficoBarras} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis allowDecimals={false} tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<DarkTooltip />} />
                    <Legend wrapperStyle={{ color: COLORS.muted, fontSize: 12 }} iconType="circle" />
                    <Bar dataKey="pitchers" name="Pitchers" fill={COLORS.accent} radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="flex h-[300px] items-center justify-center text-center" style={{ color: COLORS.muted }}>
                No tienes equipos o pitchers para mostrar.
              </p>
            )}
          </div>
        </div>

        {/* Próximos Partidos más sobrio */}
        <div
          className="rounded-2xl p-6"
          style={{ background: COLORS.surface, border: `1px solid ${COLORS.border}` }}
        >
          <h3 className="mb-4 flex items-center text-base font-semibold" style={{ color: COLORS.text }}>
            <CalendarDaysIcon className="mr-2 h-5 w-5" style={{ color: COLORS.accent }} />
            Tus Próximos Partidos Programados
          </h3>

          {proximosPartidos.length ? (
            <ul className="space-y-3">
              {proximosPartidos.map((p: any) => (
                <li
                  key={p.id}
                  className="flex flex-col items-start justify-between gap-2 rounded-xl p-4 sm:flex-row sm:items-center"
                  style={{
                    background: COLORS.surfaceAlt,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div>
                    <div className="text-sm" style={{ color: COLORS.muted }}>Partido</div>
                    <div className="text-lg font-semibold" style={{ color: COLORS.text }}>
                      {p.equipoLocal} <span style={{ color: COLORS.muted }}>vs</span> {p.equipoVisitante}
                    </div>
                  </div>
                  <div className="text-sm font-medium" style={{ color: COLORS.text }}>
                    {format(new Date(p.fecha), "eeee dd/MM · HH:mm 'hs'", { locale: es })}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="py-8 text-center" style={{ color: COLORS.muted }}>No tienes partidos programados.</p>
          )}
        </div>
      </div>
    </main>
  );
}
