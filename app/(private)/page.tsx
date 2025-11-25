"use client";

import React from "react";
import Link from "next/link";
import { useDashboard } from "hooks/useDashboard";
import { usePartidos } from "hooks/usePartidos";
import { useAuth } from "@/context/AuthContext";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ChartPieIcon, ChartBarIcon, CalendarDaysIcon,
  UsersIcon, UserGroupIcon, CalendarIcon
} from "@heroicons/react/24/solid";

/* ===== Theme tokens (we use Tailwind classes / CSS variables) ===== */

/* ===== Helpers ===== */
const Card = ({ children, className = "", style }: React.PropsWithChildren<{ className?: string; style?: React.CSSProperties }>) => (
  <div
    className={["rounded-md p-4 transition-all duration-200 hover:shadow-lg bg-card border border-appborder hover:border-[rgba(var(--color-text-rgb),0.15)]", className].join(" ")}
    style={style}
  >
    {children}
  </div>
);

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div className="mb-3">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-accent">{icon}</span>
      <h3 className="text-sm font-semibold text-apptext">{title}</h3>
    </div>
    <div className="h-px bg-appborder" />
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DarkTooltip = ({ active, payload, label }: any) =>
  !active || !payload?.length ? null : (
    <div
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-border)',
        padding: '8px 10px',
        borderRadius: 8,
        color: 'var(--color-text)',
        fontSize: 12,
        boxShadow: '0 6px 20px rgba(0,0,0,0.18)'
      }}
    >
      <div style={{ opacity: 0.75, marginBottom: 4 }}>{label}</div>
      <div>
        <b>{payload[0].name ?? payload[0].dataKey}</b>: {payload[0].value}
      </div>
    </div>
  );

/* ===== Página ===== */
type PiePoint = { name: string; value: number };
type BarPoint = { name: string; pitchers: number };

export default function InicioPage() {
  const { query } = useDashboard();
  const { user } = useAuth();
  const { list: partidosList } = usePartidos();

  if (query.isLoading) return <p className="p-6 text-apptext">Cargando…</p>;
  if (query.isError)   return <p className="p-6 text-red-300">Error: {(query.error as Error).message}</p>;
  if (!query.data)     return <p className="p-6 text-apptext">Sin datos.</p>;

  const { kpis, graficoTorta, graficoBarras, proximosPartidos } = query.data;
  const pieData = (graficoTorta ?? []) as PiePoint[];
  const barData = (graficoBarras ?? []) as BarPoint[];

  // Fallback local derivation of PROGRAMADO matches when dashboard gives none
  const programadosLocal = (partidosList.data ?? [])
    .filter(p => p.estado === 'PROGRAMADO')
    .map(p => ({
      id: p.id,
      fecha: p.fecha,
      equipoLocal: p.equipoLocal.nombre,
      equipoVisitante: p.equipoVisitante.nombre
    }));

  const proximos = (proximosPartidos && proximosPartidos.length > 0) ? proximosPartidos : programadosLocal;

  return (
    <main className="min-h-screen bg-bg text-apptext p-6">
      <div className="mx-auto w-full max-w-7xl">
        {/* Título */}
        <header className="mb-4 border-b border-appborder pb-2 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-apptext">Inicio</h1>
          {user?.name && (
            <div
              className="flex items-center gap-2 rounded-md px-4 py-2"
              style={{
                background: 'linear-gradient(135deg, rgba(var(--color-text-rgb),0.15), rgba(var(--color-text-rgb),0.05))',
                boxShadow: '0 0 0 1px var(--color-border), 0 4px 14px -2px rgba(0,0,0,0.35)'
              }}
            >
              <span
                className="text-sm sm:text-base font-semibold tracking-wide"
                style={{ color: 'var(--greeting-color)', textShadow: '0 1px 1px rgba(0,0,0,0.15)' }}
              >
                Hola, {user.name}
              </span>
            </div>
          )}
        </header>

        {/* KPIs */}
  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-5">
          {[
            { href: "/equipos",  label: "Mis Equipos",  icon: <UsersIcon className="h-5 w-5" />,      value: kpis.equipos },
            { href: "/pitchers", label: "Mis Pitchers", icon: <UserGroupIcon className="h-5 w-5" />,  value: kpis.pitchers },
            { href: "/partidos", label: "Mis Partidos", icon: <CalendarIcon className="h-5 w-5" />,   value: kpis.partidos },
          ].map((it) => (
            <Link key={it.href} href={it.href}>
              <Card className="bg-card">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted">{it.label}</span>
                    <span className="text-accent">{it.icon}</span>
                  </div>
                  <div className="text-4xl font-semibold text-apptext mt-2 leading-tight">
                    {it.value}
                  </div>
                </Card>
            </Link>
          ))}
        </div>

        {/* Resumen */}
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm text-muted">Resumen general</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 rounded border border-appborder bg-card text-apptext text-sm transition-colors hover:bg-[rgba(var(--color-text-rgb),0.08)]">Últimos 7 días</button>
            <button className="px-3 py-1 rounded border border-appborder text-muted text-sm transition-colors hover:bg-[rgba(var(--color-text-rgb),0.05)] hover:text-apptext">Últimos 30 días</button>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2" style={{ marginBottom: 20 }}>
          {/* Donut */}
          <Card>
            <SectionHeader icon={<ChartPieIcon className="h-5 w-5" />} title="Estado de Partidos" />
            {pieData.length ? (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={90}>
                      {pieData.map((e, i) => (
                        <Cell key={i} fill={e.name?.toUpperCase() === "FINALIZADO" ? 'var(--color-accent2)' : 'var(--color-accent)'} />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              ) : (
              <p className="text-muted flex items-center justify-center h-72">No hay datos de partidos para mostrar.</p>
            )}
            <div className="flex gap-3 mt-2 text-sm text-muted">
              <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent)' }} /> Programado</span>
              <span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{ background: 'var(--color-accent2)' }} /> Finalizado</span>
            </div>
          </Card>

          {/* Barras con animación hover */}
          <Card>
            <SectionHeader icon={<ChartBarIcon className="h-5 w-5" />} title="Pitchers por Equipo" />
            {barData.length ? (
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={barData}
                    margin={{ top: 8, right: 20, left: 0, bottom: 0 }}
                    barSize={54}
                    barGap={12}
                    barCategoryGap="22%"
                  >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={8} tick={{ fill: 'var(--color-muted)', fontSize: 12 }} />
                <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: 'var(--color-muted)', fontSize: 12 }} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar
                      dataKey="pitchers"
                      name="Pitchers"
                      fill={'var(--color-accent)'}
                      radius={[6, 6, 0, 0]}
                      activeBar={{ fill: "#ffa24c", opacity: 0.9 }}
                      animationDuration={400}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              ) : (
              <p className="text-muted flex items-center justify-center h-72">No tienes equipos o pitchers para mostrar.</p>
            )}
          </Card>
        </div>

        {/* Próximos partidos */}
        <Card>
          <SectionHeader icon={<CalendarDaysIcon className="h-5 w-5" />} title="Tus Próximos Partidos Programados" />
          {proximos.length ? (
            <div className="overflow-x-auto rounded-lg">
              <table className="w-full text-left min-w-[640px] border-collapse">
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}>
                    <th className="py-2 px-4 font-medium">Fecha</th>
                    <th className="py-2 px-4 font-medium">Horario</th>
                    <th className="py-2 px-4 font-medium">Equipos</th>
                    <th className="py-2 px-4 font-medium">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {proximos.map((p) => {
                    const fechaHora = new Date(p.fecha);
                    return (
                      <tr key={p.id} className="transition-colors" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}>
                        <td className="py-3 px-4">{format(fechaHora, 'dd-MM-yyyy', { locale: es })}</td>
                        <td className="py-3 px-4">{format(fechaHora, 'HH:mm', { locale: es })}</td>
                        <td className="py-3 px-4">{p.equipoLocal} <span className="text-muted">vs</span> {p.equipoVisitante}</td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/partidos/${p.id}/scout`}
                            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                            style={{
                              backgroundColor: 'var(--color-accent)',
                              color: 'var(--color-text)'
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#C7430D')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-accent)')}
                          >
                            Empezar
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted text-center py-5">No tienes partidos programados.</p>
          )}
        </Card>
      </div>
    </main>
  );
}
