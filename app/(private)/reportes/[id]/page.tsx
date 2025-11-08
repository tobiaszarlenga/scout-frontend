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

  const lanzamientos = lanzamientosQuery.data ?? [];

  const getTipoNombre = (l: LanzamientoServer) => {
    if (l.tipo?.nombre) return l.tipo.nombre;
    if (l.tipoId && tipos.data) {
      const t = tipos.data.find((x) => x.id === l.tipoId);
      return t ? t.nombre : String(l.tipoId);
    }
    return "-";
  };

  const getResultadoNombre = (l: LanzamientoServer) => {
    if (l.resultado?.nombre) return l.resultado.nombre;
    if (l.resultadoId && resultados.data) {
      const r = resultados.data.find((x) => x.id === l.resultadoId);
      return r ? r.nombre : String(l.resultadoId);
    }
    return "-";
  };

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
        background: `linear-gradient(135deg, var(--color-sidebar), var(--color-sidebar))`,
        color: `var(--color-text)`,
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between pb-6">
          <div>
            <button
              onClick={() => router.push("/partidos")}
              className="text-sm hover:opacity-80"
              style={{ color: "var(--color-text)" }}
            >
              &larr; Volver a Partidos
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
                    <th className="py-2 px-4">Comentario</th>
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
                      <td className="py-2 px-4">{l.comentario ?? "-"}</td>
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
            <div className="p-4 border rounded flex-1" style={{ backgroundColor: "var(--color-card)", borderColor: "var(--color-border)" }}>
              <div className="text-sm mb-2" style={{ color: "var(--color-text)" }}>
                Interpretación
              </div>
              <div className="text-sm" style={{ color: "var(--color-text)" }}>
                Mayor número = más lanzamientos en esa zona. La intensidad visual es relativa al mayor recuento en el partido.
              </div>
              <div className="mt-4 text-sm" style={{ color: "var(--color-text)" }}>
                Máximo en una celda: <strong>{Math.max(...zoneCounts)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
