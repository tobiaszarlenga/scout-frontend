"use client";

import React, { useEffect, useMemo, useState } from "react";
import { usePitchers } from "@/hooks/usePitchers";
import { usePartidos } from "@/hooks/usePartidos";
import { format } from "date-fns";
import Link from "next/link";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as ReTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

export default function PitcherHistoricalReport({ params }: { params: Promise<{ pitcherId: string }> }) {
  const { pitcherId } = React.use(params);
  const pid = Number(pitcherId);

  const { list: pitchersQuery } = usePitchers();
  const { list: partidosQuery } = usePartidos();

  const pitcher = pitchersQuery.data?.find((p) => p.id === pid) ?? null;

  const matches = useMemo(() => {
    if (!partidosQuery.data) return [];
    return partidosQuery.data.filter(
      (p) => p.pitcherLocalId === pid || p.pitcherVisitanteId === pid
    );
  }, [partidosQuery.data, pid]);

  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [avgVel, setAvgVel] = useState<number | null>(null);
  const [zoneCounts, setZoneCounts] = useState<number[]>(new Array(25).fill(0));
  const [byResultado, setByResultado] = useState<Record<string, number>>({});
  const [byTipo, setByTipo] = useState<Record<string, number>>({});

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        // Llamamos al endpoint agregado en backend que devuelve las estadísticas agregadas
        const data = await (await import('@/lib/api')).pitcherApi.stats(pid);
        if (mounted) {
          setTotal(data.total ?? 0);
          setAvgVel(data.avgVel ?? null);
          setZoneCounts(Array.isArray(data.zoneCounts) && data.zoneCounts.length === 25 ? data.zoneCounts : new Array(25).fill(0));
          setByResultado(data.byResultado || {});
          setByTipo(data.byTipo || {});
        }
      } catch (err) {
        console.error('Error cargando estadísticas del pitcher:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    // sólo cargar si el pitcher existe y hay al menos 1 partido (evitamos llamadas innecesarias)
    if (pitcher) load();
    return () => {
      mounted = false;
    };
  }, [pitcher, pid]);

  const maxZone = Math.max(...zoneCounts, 1);

  const totalResultados = Object.values(byResultado).reduce((a, b) => a + b, 0);
  const totalTipos = Object.values(byTipo).reduce((a, b) => a + b, 0);

  const resultadoData = useMemo(
    () =>
      Object.entries(byResultado).map(([name, value]) => ({
        name,
        value,
        percent: totalResultados > 0 ? (value / totalResultados) * 100 : 0,
      })),
    [byResultado, totalResultados]
  );

  const tipoData = useMemo(
    () =>
      Object.entries(byTipo).map(([name, value]) => ({
        name,
        value,
        percent: totalTipos > 0 ? (value / totalTipos) * 100 : 0,
      })),
    [byTipo, totalTipos]
  );

  const RESULT_COLORS = ["#ff7a1a", "#7ad7f0", "#9ae6b4", "#f6ad55", "#c084fc", "#f472b6"];
  const TIPO_COLORS = ["#2dd4bf", "#fb923c", "#60a5fa", "#a78bfa", "#fca5a5", "#34d399"];

  return (
    <main className="min-h-full w-full max-w-full px-6 py-6 sm:px-10 sm:py-8" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between pb-6">
          <div>
            <Link href="/reportes" className="text-sm hover:opacity-80" style={{ color: 'var(--color-text)', textDecoration: 'none' }}>
              &larr; Volver a Reportes
            </Link>
            <h1 className="text-3xl font-bold">Informe histórico: {pitcher ? `${pitcher.nombre} ${pitcher.apellido}` : `ID ${pitcherId}`}</h1>
            <p className="text-sm text-gray-400">Partidos analizados: {matches.length}</p>
          </div>
        </header>

        <div className="p-6 rounded-lg shadow-xl" style={{ backgroundColor: "var(--color-card)" }}>
          {loading ? (
            <p>Cargando estadísticas...</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-sm opacity-80">Total Lanzamientos</div>
                <div className="text-2xl font-bold">{total}</div>
                {avgVel !== null && <div className="text-sm mt-2">Velocidad promedio: <strong>{avgVel.toFixed(1)}</strong></div>}
              </div>

              <div className="p-4 border rounded" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-sm opacity-80">Por Resultado</div>
                <div className="mt-2">
                  {Object.entries(byResultado).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1">
                      <span>{k}</span><span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border rounded" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-sm opacity-80">Por Tipo de Tiro</div>
                <div className="mt-2">
                  {Object.entries(byTipo).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1">
                      <span>{k}</span><span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 border rounded" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-sm opacity-80 mb-2">Heatmap (5x5)</div>
                <div className="grid grid-cols-5 gap-1 mt-2 mx-auto" style={{ width: 'fit-content', maxWidth: '100%' }}>
                  {Array.from({ length: 5 }).map((_, r) =>
                    Array.from({ length: 5 }).map((__, c) => {
                      const idx = r * 5 + c;
                      const count = zoneCounts[idx] || 0;
                      const intensity = Math.min(1, count / maxZone);
                      const bg = `rgba(255,122,26,${0.08 + 0.8 * intensity})`;
                      return (
                        <div key={`${r}-${c}`} className="aspect-square flex items-center justify-center text-xs font-medium rounded" style={{ background: bg, minWidth: '32px', width: '100%' }}>
                          {count}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sección de Gráficos */}
        <div className="mt-6 p-6 rounded-lg shadow-xl" style={{ backgroundColor: "var(--color-card)" }}>
          <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--color-text)" }}>Análisis de Resultados y Tipos de Tiro</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Resultados */}
            <div className="p-4 border rounded" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Distribución de Resultados (%)</div>
              {resultadoData.length === 0 ? (
                <p className="text-sm opacity-70 text-center py-8">Sin datos todavía.</p>
              ) : (
                <>
                  <div style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={resultadoData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={50}
                          outerRadius={100}
                          paddingAngle={2}
                        >
                          {resultadoData.map((_, idx) => (
                            <Cell key={idx} fill={RESULT_COLORS[idx % RESULT_COLORS.length]} />
                          ))}
                        </Pie>
                        <ReTooltip
                          formatter={(value: number) => `${value}`}
                          contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                          labelStyle={{ color: "var(--color-text)" }}
                          itemStyle={{ color: "var(--color-text)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    {resultadoData.map((r, idx) => (
                      <div key={r.name} className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-3 h-3 rounded" style={{ background: RESULT_COLORS[idx % RESULT_COLORS.length] }} />
                          {r.name}
                        </span>
                        <span className="font-semibold">{r.value} ({r.percent.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Gráfico de Tipos de Tiro */}
            <div className="p-4 border rounded" style={{ borderColor: "var(--color-border)" }}>
              <div className="text-sm font-semibold mb-3" style={{ color: "var(--color-text)" }}>Distribución de Tipos de Tiro (%)</div>
              {tipoData.length === 0 ? (
                <p className="text-sm opacity-70 text-center py-8">Sin datos todavía.</p>
              ) : (
                <>
                  <div style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={tipoData} margin={{ top: 8, right: 12, left: 0, bottom: 40 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                        <XAxis
                          dataKey="name"
                          tick={{ fill: "var(--color-muted)", fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          angle={-30}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis tick={{ fill: "var(--color-muted)", fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                        <ReTooltip
                          formatter={(value: number) => `${value}`}
                          contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", color: "var(--color-text)" }}
                          labelStyle={{ color: "var(--color-text)" }}
                          itemStyle={{ color: "var(--color-text)" }}
                        />
                        <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                          {tipoData.map((_, idx) => (
                            <Cell key={idx} fill={TIPO_COLORS[idx % TIPO_COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2 text-xs">
                    {tipoData.map((t, idx) => (
                      <div key={t.name} className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-3 h-3 rounded" style={{ background: TIPO_COLORS[idx % TIPO_COLORS.length] }} />
                          {t.name}
                        </span>
                        <span className="font-semibold">{t.value} ({t.percent.toFixed(1)}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-lg" style={{ backgroundColor: "var(--color-card)", border: "1px solid var(--color-border)" }}>
          <h3 className="font-semibold mb-3">Partidos incluidos</h3>
          <ul className="space-y-2 text-sm">
            {matches.map((m) => (
              <li key={m.id} className="flex justify-between">
                <span>{m.equipoLocal.nombre} vs {m.equipoVisitante.nombre} — {format(new Date(m.fecha), "dd-MM-yyyy HH:mm")}</span>
                <a href={`/reportes/${m.id}`} style={{ color: "var(--color-accent)" }}>Ver partido</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
