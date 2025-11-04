"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { usePartido } from '@/hooks/usePartidos';
import { useLanzamientos } from '@/hooks/useLanzamientos';
import { useLookups } from '@/hooks/useLookups';
import type { LanzamientoDTO } from '@/lib/api';
import type { TipoLanzamiento, ResultadoLanzamiento } from 'types/lookup';

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
    return '-';
  };

  const getResultadoNombre = (l: LanzamientoServer) => {
    if (l.resultado?.nombre) return l.resultado.nombre;
    if (l.resultadoId && resultados.data) {
      const r = resultados.data.find((x) => x.id === l.resultadoId);
      return r ? r.nombre : String(l.resultadoId);
    }
    return '-';
  };

  // Metrics
  const total = lanzamientos.length;
  const byResultado = (lanzamientos as LanzamientoServer[]).reduce((acc: Record<string, number>, l) => {
    const name = getResultadoNombre(l).toUpperCase();
    acc[name] = (acc[name] || 0) + 1;
    return acc;
  }, {});

  const byPitcher: Record<string, number> = {};
  (lanzamientos as LanzamientoServer[]).forEach((l) => {
    const pname = l.pitcher ? `${l.pitcher.nombre ?? ''} ${l.pitcher.apellido ?? ''}`.trim() : (l.pitcherId ? String(l.pitcherId) : 'Desconocido');
    byPitcher[pname] = (byPitcher[pname] || 0) + 1;
  });

  // Average velocity (km/h or unit used): compute over lanzamientos with velocidad
  const velocidades = (lanzamientos as LanzamientoServer[])
    .map((l) => (typeof l.velocidad === 'number' ? l.velocidad : null))
    .filter((v): v is number => v !== null && !Number.isNaN(v));
  const avgVelocity = velocidades.length > 0 ? velocidades.reduce((a, b) => a + b, 0) / velocidades.length : null;

  // Zone heatmap (5x5): counts per zone index = y*5 + x
  const zoneCounts = new Array<number>(25).fill(0);
  (lanzamientos as LanzamientoServer[]).forEach((l) => {
    if (typeof l.x === 'number' && typeof l.y === 'number') {
      const idx = l.y * 5 + l.x;
      if (idx >= 0 && idx < 25) zoneCounts[idx] += 1;
    }
  });
  const maxZone = Math.max(...zoneCounts, 1);

  return (
    <main className="min-h-full w-full max-w-full bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between pb-6">
          <div>
            <button onClick={() => router.push('/partidos')} className="text-sm text-gray-200 hover:text-white">&larr; Volver a Partidos</button>
            <h1 className="text-3xl md:text-4xl font-bold text-white">Reporte del Partido</h1>
            {partido && (
              <p className="text-gray-200">{partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre} — {format(new Date(partido.fecha), 'dd-MM-yyyy HH:mm')}</p>
            )}
          </div>
        </header>

        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-4">Resumen</h2>
          {loadingPartido && <p>Cargando...</p>}
          {!loadingPartido && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Total Lanzamientos</div>
                <div className="text-2xl font-bold">{total}</div>
              </div>
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Promedio Velocidad</div>
                <div className="text-2xl font-bold">{avgVelocity ? `${avgVelocity.toFixed(1)}` : 'N/A'}</div>
                <div className="text-sm text-gray-500">(promedio de lanzamientos con velocidad)</div>
              </div>
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Por Resultado</div>
                <div className="mt-2">
                  {Object.entries(byResultado).map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm py-1"><span>{k}</span><span className="font-semibold">{v}</span></div>
                  ))}
                </div>
              </div>
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500">Por Pitcher</div>
                <div className="mt-2">
                  {Object.entries(byPitcher).map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm py-1"><span>{k}</span><span className="font-semibold">{v}</span></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <h3 className="text-lg font-semibold mt-4 mb-2">Lanzamientos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[700px]">
              <thead>
                <tr className="border-b text-gray-600">
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
                {(lanzamientos as LanzamientoServer[]).map((l) => (
                  <tr key={l.id} className="border-b hover:bg-gray-50 text-gray-800">
                    <td className="py-2 px-4">{l.inning}</td>
                    <td className="py-2 px-4">{l.ladoInning}</td>
                    <td className="py-2 px-4 text-sm">{l.pitcher ? `${l.pitcher.nombre ?? ''} ${l.pitcher.apellido ?? ''}`.trim() : (l.pitcherId ? String(l.pitcherId) : '-')}</td>
                    <td className="py-2 px-4">{getTipoNombre(l)}</td>
                    <td className="py-2 px-4">{getResultadoNombre(l)}</td>
                    <td className="py-2 px-4">{typeof l.x === 'number' && typeof l.y === 'number' ? (l.y * 5 + l.x) : '-'}</td>
                    <td className="py-2 px-4">{l.comentario ?? '-'}</td>
                    <td className="py-2 px-4">{l.creadoEn ? format(new Date(l.creadoEn), 'dd-MM-yyyy HH:mm:ss') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Heatmap */}
          <h3 className="text-lg font-semibold mt-6 mb-2">Heatmap de Zona (5x5)</h3>
          <div className="w-full flex flex-col md:flex-row gap-4">
            <div className="p-4 border rounded bg-white">
              <div className="grid grid-cols-5 gap-1 w-[250px]">
                {(new Array(5)).fill(0).map((_, row) => (
                  // For each row, render 5 cells
                  (new Array(5)).fill(0).map((__, col) => {
                    const idx = row * 5 + col;
                    const count = zoneCounts[idx] || 0;
                    const intensity = Math.min(1, count / maxZone);
                    const bg = `rgba(13,110,253,${0.08 + 0.85 * intensity})`;
                    return (
                      <div key={`${row}-${col}`} className="h-12 w-12 flex items-center justify-center text-sm font-medium text-white rounded" style={{ background: bg }}>
                        {count}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>
            <div className="p-4 border rounded bg-white flex-1">
              <div className="text-sm text-gray-600 mb-2">Interpretación</div>
              <div className="text-sm text-gray-800">Mayor número = más lanzamientos en esa zona. La intensidad visual es relativa al mayor recuento en el partido.</div>
              <div className="mt-4 text-sm text-gray-600">Máximo en una celda: <strong>{Math.max(...zoneCounts)}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
