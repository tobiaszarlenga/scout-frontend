"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { usePartido } from "@/hooks/usePartidos";
import { useLanzamientos } from "@/hooks/useLanzamientos";
import { useLookups } from "@/hooks/useLookups";
import type { LanzamientoDTO } from "@/lib/api";
import type { TipoLanzamiento, ResultadoLanzamiento } from "types/lookup";

type LanzamientoServer = LanzamientoDTO & {
  tipo?: TipoLanzamiento;
  resultado?: ResultadoLanzamiento;
  pitcher?: { id?: number; nombre?: string; apellido?: string };
  x?: number;
  y?: number;
  creadoEn?: string;
};

export default function ReportePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();

  const { data: partido, isLoading: loadingPartido } = usePartido(id);
  const { list: lanzamientosQuery } = useLanzamientos(id);
  const { tipos, resultados } = useLookups();

  const lanzamientos = React.useMemo(() => lanzamientosQuery.data ?? [], [lanzamientosQuery.data]);

  const getTipoNombre = React.useCallback((l: LanzamientoServer) => {
    if (l.tipo?.nombre) return l.tipo.nombre;
    if (l.tipoId && tipos.data) {
      const t = tipos.data.find((x) => x.id === l.tipoId);
      return t ? t.nombre : String(l.tipoId);
    }
    return "-";
  }, [tipos.data]);

  const getResultadoNombre = React.useCallback((l: LanzamientoServer) => {
    if (l.resultado?.nombre) return l.resultado.nombre;
    if (l.resultadoId && resultados.data) {
      const r = resultados.data.find((x) => x.id === l.resultadoId);
      return r ? r.nombre : String(l.resultadoId);
    }
    return "-";
  }, [resultados.data]);

  // Métricas
  const total = lanzamientos.length;
  const byResultado = (lanzamientos as LanzamientoServer[]).reduce(
    (acc: Record<string, number>, l) => {
      const name = getResultadoNombre(l).toUpperCase();
      acc[name] = (acc[name] || 0) + 1;
      return acc;
    },
    {}
  );

  const byPitcher: Record<string, number> = {};
  (lanzamientos as LanzamientoServer[]).forEach((l) => {
    const pname = l.pitcher
      ? `${l.pitcher.nombre ?? ""} ${l.pitcher.apellido ?? ""}`.trim()
      : l.pitcherId
      ? String(l.pitcherId)
      : "Desconocido";
    byPitcher[pname] = (byPitcher[pname] || 0) + 1;
  });

  // Velocidad promedio
  const velocidades = (lanzamientos as LanzamientoServer[])
    .map((l) => (typeof l.velocidad === "number" ? l.velocidad : null))
    .filter((v): v is number => v !== null && !Number.isNaN(v));
  const avgVelocity =
    velocidades.length > 0
      ? velocidades.reduce((a, b) => a + b, 0) / velocidades.length
      : null;

  // Heatmap
  const zoneCounts = new Array<number>(25).fill(0);
  (lanzamientos as LanzamientoServer[]).forEach((l) => {
    if (typeof l.x === "number" && typeof l.y === "number") {
      const idx = l.y * 5 + l.x;
      if (idx >= 0 && idx < 25) zoneCounts[idx] += 1;
    }
  });
  const maxZone = Math.max(...zoneCounts, 1);

  // ===== Análisis avanzado por pitcher =====
  const pitcherStats = React.useMemo(() => {
    const stats: Record<string, {
      nombre: string;
      total: number;
      strikes: number;
      bolas: number;
      outs: number;
      hits: number;
      avgVel: number | null;
      zonaFavorita: number | null;
      efectividad: number;
    }> = {};

    (lanzamientos as LanzamientoServer[]).forEach((l) => {
      const pname = l.pitcher
        ? `${l.pitcher.nombre ?? ""} ${l.pitcher.apellido ?? ""}`.trim()
        : l.pitcherId
        ? String(l.pitcherId)
        : "Desconocido";

      if (!stats[pname]) {
        stats[pname] = {
          nombre: pname,
          total: 0,
          strikes: 0,
          bolas: 0,
          outs: 0,
          hits: 0,
          avgVel: null,
          zonaFavorita: null,
          efectividad: 0,
        };
      }

      const stat = stats[pname];
      stat.total += 1;

      // Contar resultados
      const resultado = getResultadoNombre(l).toUpperCase();
      if (resultado === "STRIKE") stat.strikes += 1;
      if (resultado === "BOLA") stat.bolas += 1;
      if (resultado === "OUT") stat.outs += 1;
      if (resultado === "HIT") stat.hits += 1;
    });

    // Calcular promedios y zona favorita por pitcher
    Object.keys(stats).forEach((pname) => {
      const pitcherLanzamientos = (lanzamientos as LanzamientoServer[]).filter((l) => {
        const name = l.pitcher
          ? `${l.pitcher.nombre ?? ""} ${l.pitcher.apellido ?? ""}`.trim()
          : l.pitcherId
          ? String(l.pitcherId)
          : "Desconocido";
        return name === pname;
      });

      // Velocidad promedio
      const vels = pitcherLanzamientos
        .map((l) => l.velocidad)
        .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
      stats[pname].avgVel = vels.length > 0 ? vels.reduce((a, b) => a + b, 0) / vels.length : null;

      // Zona más usada
      const pitcherZones: Record<number, number> = {};
      pitcherLanzamientos.forEach((l) => {
        if (typeof l.x === "number" && typeof l.y === "number") {
          const idx = l.y * 5 + l.x;
          pitcherZones[idx] = (pitcherZones[idx] || 0) + 1;
        }
      });
      const zonaEntries = Object.entries(pitcherZones);
      if (zonaEntries.length > 0) {
        const [zona] = zonaEntries.sort((a, b) => b[1] - a[1])[0];
        stats[pname].zonaFavorita = Number(zona);
      }

      // Efectividad: proporción de strikes sobre (strikes + bolas)
      const lanzamientosContados = stats[pname].strikes + stats[pname].bolas;
      stats[pname].efectividad = lanzamientosContados > 0
        ? (stats[pname].strikes / lanzamientosContados) * 100
        : 0;
    });

    return stats;
  }, [lanzamientos, getResultadoNombre]);

  // ===== Paginación tabla =====
  const [page, setPage] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(25);
  const totalPages = Math.max(1, Math.ceil(lanzamientos.length / pageSize));
  const start = (page - 1) * pageSize;
  const pageData = (lanzamientos as LanzamientoServer[]).slice(start, start + pageSize);
  const goPrev = () => setPage((p) => Math.max(1, p - 1));
  const goNext = () => setPage((p) => Math.min(totalPages, p + 1));
  React.useEffect(() => { setPage(1); }, [pageSize, lanzamientos.length]);

  return (
    <main
      className="min-h-full w-full max-w-full px-6 py-6 sm:px-10 sm:py-8"
      style={{
        background: `linear-gradient(135deg, var(--color-bg), var(--color-bg))`,
        color: `var(--color-text)`,
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between pb-6">
          <div>
            <button
              onClick={() => router.push("/reportes")}
              className="text-sm hover:opacity-80"
              style={{ color: "var(--color-text)" }}
            >
              &larr; Volver a Reportes
            </button>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: "var(--color-text)" }}>
              Reporte del Partido
            </h1>
            {partido && (
              <p style={{ color: "var(--color-text)" }}>
                {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre} —{" "}
                {format(new Date(partido.fecha), "dd-MM-yyyy HH:mm")}
              </p>
            )}
          </div>
        </header>

        <div className="p-6 rounded-lg shadow-xl" style={{ backgroundColor: "var(--color-card)" }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--color-text)" }}>
            Resumen
          </h2>

          {loadingPartido && <p>Cargando...</p>}
          {!loadingPartido && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 border rounded" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-sm opacity-80">Total Lanzamientos</div>
                <div className="text-2xl font-bold">{total}</div>
              </div>
              <div className="p-4 border rounded" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-sm opacity-80">Promedio Velocidad</div>
                <div className="text-2xl font-bold">{avgVelocity ? `${avgVelocity.toFixed(1)}` : "N/A"}</div>
                <div className="text-sm opacity-60">(promedio de lanzamientos con velocidad)</div>
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
                <div className="text-sm opacity-80">Por Pitcher</div>
                <div className="mt-2">
                  {Object.entries(byPitcher).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm py-1">
                      <span>{k}</span><span className="font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== Tabla con header sticky + scroll + paginación ===== */}
          <h3 className="text-lg font-semibold mt-4 mb-2" style={{ color: "var(--color-accent)" }}>
            Lanzamientos
          </h3>

          <div className="overflow-x-auto">
            <div className="rounded" style={{ maxHeight: 480, overflowY: "auto", border: "1px solid var(--color-border)" }}>
              <table className="w-full text-left min-w-[700px]">
                <thead className="sticky top-0 z-10" style={{ backgroundColor: "var(--color-card)", color: "var(--color-text)" }}>
                  <tr className="border-b" style={{ borderColor: "var(--color-border)" }}>
                    <th className="py-2 px-4">Inning</th>
                    <th className="py-2 px-4">Lado</th>
                    <th className="py-2 px-4">Pitcher</th>
                    <th className="py-2 px-4">Tipo</th>
                    <th className="py-2 px-4">Resultado</th>
                    <th className="py-2 px-4">Zona</th>
                    <th className="py-2 px-4">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((l) => (
                    <tr key={l.id} className="border-b hover:opacity-90" style={{ borderColor: "var(--color-border)", color: "var(--color-text)" }}>
                      <td className="py-2 px-4">{l.inning}</td>
                      <td className="py-2 px-4">{l.ladoInning}</td>
                      <td className="py-2 px-4 text-sm">
                        {l.pitcher
                          ? `${l.pitcher.nombre ?? ""} ${l.pitcher.apellido ?? ""}`.trim()
                          : l.pitcherId
                          ? String(l.pitcherId)
                          : "-"}
                      </td>
                      <td className="py-2 px-4">{getTipoNombre(l)}</td>
                      <td className="py-2 px-4">{getResultadoNombre(l)}</td>
                      <td className="py-2 px-4">
                        {typeof l.x === "number" && typeof l.y === "number" ? l.y * 5 + l.x : "-"}
                      </td>
                      <td className="py-2 px-4">
                        {l.creadoEn ? format(new Date(l.creadoEn), "dd-MM-yyyy HH:mm:ss") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            <div className="flex items-center justify-between gap-3 mt-3">
              <div className="flex items-center gap-2">
                <button
                  onClick={goPrev}
                  disabled={page === 1}
                  className="px-3 py-1 rounded disabled:opacity-40"
                  style={{ backgroundColor: "var(--color-card)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
                >
                  ← Anterior
                </button>
                <button
                  onClick={goNext}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded disabled:opacity-40"
                  style={{ backgroundColor: "var(--color-card)", color: "var(--color-text)", border: "1px solid var(--color-border)" }}
                >
                  Siguiente →
                </button>
                <span className="text-sm opacity-80">
                  Página {page} de {totalPages} — {lanzamientos.length} registros
                </span>
              </div>

              <label className="text-sm opacity-80 flex items-center gap-2">
                Ver
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 rounded"
                  style={{ backgroundColor: "var(--color-card)", color: "var(--color-text)", border: "1px solid var(--color-border)", cursor: "pointer" }}
                >
                  {[10, 25, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
                por página
              </label>
            </div>
          </div>

          {/* Heatmap */}
          <h3 className="text-lg font-semibold mt-6 mb-2" style={{ color: "var(--color-accent)" }}>
            Heatmap de Zona (5x5)
          </h3>
          <div className="w-full flex flex-col md:flex-row gap-4">
            <div className="p-4 border rounded" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
              <div className="grid grid-cols-5 gap-1 w-[250px]">
                {Array.from({ length: 5 }).map((_, row) =>
                  Array.from({ length: 5 }).map((__, col) => {
                    const idx = row * 5 + col;
                    const count = zoneCounts[idx] || 0;
                    const intensity = Math.min(1, count / maxZone);
                    const bg = `rgba(255,122,26,${0.1 + 0.85 * intensity})`;
                    return (
                      <div
                        key={`${row}-${col}`}
                        className="h-12 w-12 flex items-center justify-center text-sm font-medium rounded"
                        style={{ background: bg, color: "var(--color-text)" }}
                      >
                        {count}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            
            {/* Análisis estadístico mejorado */}
            <div className="p-4 border rounded flex-1" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
              <div className="text-lg font-semibold mb-3" style={{ color: "var(--color-accent2)" }}>
                📊 Análisis Estadístico
              </div>

              {/* Insights generales */}
              <div className="mb-4 pb-3 border-b" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-sm font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                  Zona más atacada
                </div>
                <div className="text-sm" style={{ color: "var(--color-text)", opacity: 0.9 }}>
                  Zona <strong>#{zoneCounts.indexOf(Math.max(...zoneCounts))}</strong> con{" "}
                  <strong>{Math.max(...zoneCounts)}</strong> lanzamientos
                  ({((Math.max(...zoneCounts) / total) * 100).toFixed(1)}% del total)
                </div>
              </div>

              {/* Análisis por pitcher */}
              <div className="text-sm font-semibold mb-2" style={{ color: "var(--color-text)" }}>
                Análisis por Pitcher
              </div>
              <div className="space-y-3">
                {Object.values(pitcherStats).map((stat) => (
                  <div key={stat.nombre} className="p-3 rounded" style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
                    <div className="font-semibold mb-1" style={{ color: "var(--color-accent)" }}>
                      {stat.nombre}
                    </div>
                    <div className="text-xs space-y-1" style={{ color: "var(--color-text)", opacity: 0.85 }}>
                      <div>• {stat.total} lanzamientos totales</div>
                      {stat.avgVel && (
                        <div>• Velocidad promedio: <strong>{stat.avgVel.toFixed(1)} km/h</strong></div>
                      )}
                      <div>
                        • Efectividad: <strong>{stat.efectividad.toFixed(1)}%</strong> 
                        <span className="opacity-70"> ({stat.strikes} strikes, {stat.bolas} bolas)</span>
                      </div>
                      {stat.zonaFavorita !== null && (
                        <div>• Zona preferida: <strong>#{stat.zonaFavorita}</strong></div>
                      )}
                      {stat.hits > 0 && (
                        <div className="text-yellow-400">⚠️ {stat.hits} hit{stat.hits > 1 ? "s" : ""} permitido{stat.hits > 1 ? "s" : ""}</div>
                      )}
                      {stat.bolas > stat.strikes && (
                        <div className="text-orange-400">⚠️ Más bolas ({stat.bolas}) que strikes ({stat.strikes})</div>
                      )}
                      {stat.efectividad >= 70 && (
                        <div className="text-green-400">✓ Excelente control de zona</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recomendaciones */}
              <div className="mt-4 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                <div className="text-xs" style={{ color: "var(--color-text)", opacity: 0.7 }}>
                  💡 <strong>Nota:</strong> Efectividad = Strikes / (Strikes + Bolas).
                  Un valor superior al 60% indica buen control de zona (más strikes que bolas).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
