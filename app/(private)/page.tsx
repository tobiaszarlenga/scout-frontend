"use client";

import React from "react";
import Link from "next/link";
import { useDashboard } from "hooks/useDashboard";
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

/* ===== Tema ===== */
const THEME = {
  bgFrom: "#0d1117",
  bgTo: "#111927",
  surface: "#161e2e",
  surfaceAlt: "#1b2434",
  border: "rgba(255,255,255,0.08)",
  text: "#e2e8f0",
  muted: "#9aa7b1",
  accent: "#ff7a1a",
  accent2: "#3FA4B7",
  radius: 6,
};

/* ===== Helpers ===== */
const Card = ({ children, style }: React.PropsWithChildren<{style?: React.CSSProperties}>) => (
  <div
    style={{
      background: THEME.surface,
      border: `1px solid ${THEME.border}`,
      borderRadius: THEME.radius,
      padding: 16,
      transition: "all 0.25s ease",
      ...style,
    }}
    className="hover:scale-[1.02] hover:shadow-lg"
  >
    {children}
  </div>
);

const SectionHeader = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <div style={{ marginBottom: 12 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
      <span style={{ color: THEME.accent }}>{icon}</span>
      <h3 style={{ color: THEME.text, fontSize: 15, fontWeight: 600 }}>{title}</h3>
    </div>
    <div style={{ height: 1, background: THEME.border }} />
  </div>
);

const DarkTooltip = ({ active, payload, label }: any) =>
  !active || !payload?.length ? null : (
    <div style={{
      background: "#0b0f16",
      border: `1px solid ${THEME.border}`,
      padding: "8px 10px",
      borderRadius: 6,
      color: THEME.text,
      fontSize: 12
    }}>
      <div style={{ opacity: 0.8, marginBottom: 4 }}>{label}</div>
      <div><b>{payload[0].name ?? payload[0].dataKey}</b>: {payload[0].value}</div>
    </div>
  );

/* ===== Página ===== */
type PiePoint = { name: string; value: number };
type BarPoint = { name: string; pitchers: number };

export default function InicioPage() {
  const { query } = useDashboard();

  if (query.isLoading) return <p style={{ color: THEME.text, padding: 24 }}>Cargando…</p>;
  if (query.isError)   return <p style={{ color: "#fca5a5", padding: 24 }}>Error: {(query.error as Error).message}</p>;
  if (!query.data)     return <p style={{ color: THEME.text, padding: 24 }}>Sin datos.</p>;

  const { kpis, graficoTorta, graficoBarras, proximosPartidos } = query.data;
  const pieData = (graficoTorta ?? []) as PiePoint[];
  const barData = (graficoBarras ?? []) as BarPoint[];

  return (
    <main style={{
      minHeight: "100vh",
      background: `linear-gradient(160deg, ${THEME.bgFrom}, ${THEME.bgTo})`,
      padding: "24px"
    }}>
      <div className="mx-auto w-full max-w-7xl">
        {/* Título */}
        <header style={{ marginBottom: 16, borderBottom: `1px solid ${THEME.border}`, paddingBottom: 8 }}>
          <h1 style={{ color: THEME.text, fontSize: 26, fontWeight: 600 }}>Inicio</h1>
        </header>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ marginBottom: 20 }}>
          {[
            { href: "/equipos",  label: "Mis Equipos",  icon: <UsersIcon className="h-5 w-5" />,      value: kpis.equipos },
            { href: "/pitchers", label: "Mis Pitchers", icon: <UserGroupIcon className="h-5 w-5" />,  value: kpis.pitchers },
            { href: "/partidos", label: "Mis Partidos", icon: <CalendarIcon className="h-5 w-5" />,   value: kpis.partidos },
          ].map((it) => (
            <Link key={it.href} href={it.href}>
              <Card style={{ background: THEME.surfaceAlt }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ color: THEME.muted, fontSize: 14 }}>{it.label}</span>
                  <span style={{ color: THEME.accent }}>{it.icon}</span>
                </div>
                <div style={{ color: THEME.text, fontSize: 36, fontWeight: 600, marginTop: 8, lineHeight: 1.1 }}>
                  {it.value}
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Resumen */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ color: THEME.muted, fontSize: 14 }}>Resumen general</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ borderRadius: THEME.radius, padding: "6px 12px", fontSize: 13, background: THEME.surfaceAlt, border: `1px solid ${THEME.border}`, color: THEME.text }}>
              Últimos 7 días
            </button>
            <button style={{ borderRadius: THEME.radius, padding: "6px 12px", fontSize: 13, background: "transparent", border: `1px solid ${THEME.border}`, color: THEME.muted }}>
              Últimos 30 días
            </button>
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
                        <Cell key={i} fill={e.name?.toUpperCase() === "FINALIZADO" ? THEME.accent2 : THEME.accent} />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ color: THEME.muted, textAlign: "center", height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                No hay datos de partidos para mostrar.
              </p>
            )}
            <div style={{ display: "flex", gap: 12, marginTop: 8, color: THEME.muted, fontSize: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: THEME.accent }} /> Programado
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: THEME.accent2 }} /> Finalizado
              </span>
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
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={8} tick={{ fill: THEME.muted, fontSize: 12 }} />
                    <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: THEME.muted, fontSize: 12 }} />
                    <Tooltip content={<DarkTooltip />} />
                    <Bar
                      dataKey="pitchers"
                      name="Pitchers"
                      fill={THEME.accent}
                      radius={[6, 6, 0, 0]}
                      /* === Animación hover === */
                      activeBar={{ fill: "#ffa24c", opacity: 0.9 }}
                      animationDuration={400}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ color: THEME.muted, textAlign: "center", height: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
                No tienes equipos o pitchers para mostrar.
              </p>
            )}
          </Card>
        </div>

        {/* Próximos partidos */}
        <Card>
          <SectionHeader icon={<CalendarDaysIcon className="h-5 w-5" />} title="Tus Próximos Partidos Programados" />
          {proximosPartidos.length ? (
            <ul style={{ borderTop: `1px solid ${THEME.border}` }}>
              {proximosPartidos.map((p: any, idx: number) => (
                <li key={p.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 0", borderBottom: idx === proximosPartidos.length - 1 ? "none" : `1px solid ${THEME.border}`
                }}>
                  <span style={{ color: THEME.text, fontSize: 15, fontWeight: 500 }}>
                    {p.equipoLocal} <span style={{ color: THEME.muted }}>vs</span> {p.equipoVisitante}
                  </span>
                  <span style={{ color: THEME.muted, fontSize: 13 }}>
                    {format(new Date(p.fecha), "dd/MM HH:mm", { locale: es })}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ color: THEME.muted, textAlign: "center", padding: "20px 0" }}>
              No tienes partidos programados.
            </p>
          )}
        </Card>
      </div>
    </main>
  );
}
