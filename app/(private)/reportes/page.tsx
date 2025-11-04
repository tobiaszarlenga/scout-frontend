"use client";

import React, { useMemo, useState } from 'react';
import { usePartidos } from '@/hooks/usePartidos';
import { usePitchers } from '@/hooks/usePitchers';
import { useEquipos } from '@/hooks/useEquipos';
import { useLanzamientos } from '@/hooks/useLanzamientos';
import { lanzamientosApi } from '@/lib/api';
import Link from 'next/link';

type Mode = 'recent' | 'match' | 'pitcher' | 'team';

export default function ReportesPage() {
  const { list: partidosQuery } = usePartidos();
  const { list: pitchersQuery } = usePitchers();
  const { list: equiposQuery } = useEquipos();

  const partidos = React.useMemo(() => partidosQuery.data ?? [], [partidosQuery.data]);
  const pitchers = React.useMemo(() => pitchersQuery.data ?? [], [pitchersQuery.data]);
  const equipos = React.useMemo(() => equiposQuery.data ?? [], [equiposQuery.data]);

  const [mode, setMode] = useState<Mode>('recent');
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedPitcherId, setSelectedPitcherId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  // For match details we use hook
  const matchLanzamientos = useLanzamientos(selectedMatchId ?? -1);

  // Recent: pick the most recent partido (by fecha)
  const recentMatch = useMemo(() => {
    if (!partidos || partidos.length === 0) return null;
    return partidos.slice().sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
  }, [partidos]);

  // Helper to list matches for a pitcher/team
  const matchesForPitcher = useMemo(() => {
    if (!selectedPitcherId) return [];
    return partidos.filter(p => p.pitcherLocalId === selectedPitcherId || p.pitcherVisitanteId === selectedPitcherId);
  }, [partidos, selectedPitcherId]);

  const matchesForTeam = useMemo(() => {
    if (!selectedTeamId) return [];
    return partidos.filter(p => p.equipoLocalId === selectedTeamId || p.equipoVisitanteId === selectedTeamId);
  }, [partidos, selectedTeamId]);

  // Aggregation util: fetch lanzamientos for given partido ids and compute totals
  const aggregateForMatches = async (matchIds: number[]) => {
    const promises = matchIds.map((id) => lanzamientosApi.listByPartido(id));
    const results = await Promise.all(promises);
    // Flatten
    const all = results.flat();
    const total = all.length;
    const velocidades = all.map(x => x.velocidad).filter(v => typeof v === 'number') as number[];
    const avgVel = velocidades.length ? velocidades.reduce((a,b) => a+b,0)/velocidades.length : null;
    const zoneCounts = new Array<number>(25).fill(0);
    all.forEach(l => {
      if (typeof l.x === 'number' && typeof l.y === 'number') {
        const idx = l.y*5 + l.x;
        if (idx >=0 && idx < 25) zoneCounts[idx]++;
      }
    });
    return { total, avgVel, zoneCounts };
  };

  return (
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between pb-6">
          <h1 className="text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Reportes
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Controls / Filters */}
          <aside className="col-span-1 bg-white p-4 rounded shadow">
            <h3 className="font-semibold mb-2">Filtros</h3>
            <div className="space-y-2">
              <button onClick={() => { setMode('recent'); setSelectedMatchId(null); }} className={`w-full text-left px-3 py-2 rounded ${mode==='recent' ? 'bg-blue-50' : ''}`}>Último Partido</button>
              <button onClick={() => setMode('match')} className={`w-full text-left px-3 py-2 rounded ${mode==='match' ? 'bg-blue-50' : ''}`}>Por Partido</button>
              <button onClick={() => setMode('pitcher')} className={`w-full text-left px-3 py-2 rounded ${mode==='pitcher' ? 'bg-blue-50' : ''}`}>Por Pitcher</button>
              <button onClick={() => setMode('team')} className={`w-full text-left px-3 py-2 rounded ${mode==='team' ? 'bg-blue-50' : ''}`}>Por Equipo</button>
            </div>

            {mode === 'match' && (
              <div className="mt-4">
                <label className="text-sm font-medium">Seleccionar Partido</label>
                <select className="w-full mt-2 border p-2 rounded" value={String(selectedMatchId ?? '')} onChange={(e) => setSelectedMatchId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">-- Elegir --</option>
                  {partidos.map(p => (
                    <option key={p.id} value={p.id}>{p.equipoLocal.nombre} vs {p.equipoVisitante.nombre} - {new Date(p.fecha).toLocaleString()}</option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'pitcher' && (
              <div className="mt-4">
                <label className="text-sm font-medium">Seleccionar Pitcher</label>
                <select className="w-full mt-2 border p-2 rounded" value={String(selectedPitcherId ?? '')} onChange={(e) => setSelectedPitcherId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">-- Elegir --</option>
                  {pitchers.map(pt => (
                    <option key={pt.id} value={pt.id}>{pt.nombre} {pt.apellido}</option>
                  ))}
                </select>
              </div>
            )}

            {mode === 'team' && (
              <div className="mt-4">
                <label className="text-sm font-medium">Seleccionar Equipo</label>
                <select className="w-full mt-2 border p-2 rounded" value={String(selectedTeamId ?? '')} onChange={(e) => setSelectedTeamId(e.target.value ? Number(e.target.value) : null)}>
                  <option value="">-- Elegir --</option>
                  {equipos.map(eq => (
                    <option key={eq.id} value={eq.id}>{eq.nombre}</option>
                  ))}
                </select>
              </div>
            )}
          </aside>

          {/* Main content */}
          <section className="col-span-3">
            <div className="bg-white p-4 rounded shadow mb-4">
              <h2 className="font-semibold">Resumen rápido</h2>
              {mode === 'recent' && recentMatch && (
                <div className="mt-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-lg font-medium">{recentMatch.equipoLocal.nombre} vs {recentMatch.equipoVisitante.nombre}</div>
                      <div className="text-sm text-gray-600">{new Date(recentMatch.fecha).toLocaleString()}</div>
                    </div>
                    <div>
                      <Link href={`/reportes/${recentMatch.id}`} className="bg-blue-600 text-white px-4 py-2 rounded">Ver reporte detallado</Link>
                    </div>
                  </div>
                </div>
              )}

              {mode === 'match' && selectedMatchId && (
                <div className="mt-3">
                  <h3 className="font-medium">Partido seleccionado</h3>
                  <div className="mt-2">
                    <Link href={`/reportes/${selectedMatchId}`} className="text-blue-600">Abrir reporte detallado</Link>
                  </div>
                  <div className="mt-4">
                    {/* Show quick table of lanzamientos for this match */}
                    {matchLanzamientos.list.isLoading && <p>Cargando lanzamientos...</p>}
                    {matchLanzamientos.list.isSuccess && (
                      <div className="text-sm text-gray-700">Lanzamientos: {matchLanzamientos.list.data.length}</div>
                    )}
                  </div>
                </div>
              )}

              {mode === 'pitcher' && selectedPitcherId && (
                <div className="mt-3">
                  <h3 className="font-medium">Partidos del Pitcher</h3>
                  <ul className="mt-2 space-y-2">
                    {matchesForPitcher.map(m => (
                      <li key={m.id} className="flex justify-between items-center border p-2 rounded">
                        <div>{m.equipoLocal.nombre} vs {m.equipoVisitante.nombre} — {new Date(m.fecha).toLocaleString()}</div>
                        <div className="space-x-2">
                          <Link href={`/reportes/${m.id}`} className="text-blue-600">Ver</Link>
                        </div>
                      </li>
                    ))}
                    {matchesForPitcher.length === 0 && <li className="text-sm text-gray-500">No se encontraron partidos para este pitcher.</li>}
                  </ul>
                  <div className="mt-4">
                    <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={async () => {
                      const ids = matchesForPitcher.map(m => m.id);
                      if (ids.length === 0) return alert('No hay partidos para agregar');
                      const agg = await aggregateForMatches(ids);
                      alert(`Total: ${agg.total}\nAvg Vel: ${agg.avgVel ? agg.avgVel.toFixed(1) : 'N/A'}`);
                    }}>Ver estadísticas agregadas</button>
                  </div>
                </div>
              )}

              {mode === 'team' && selectedTeamId && (
                <div className="mt-3">
                  <h3 className="font-medium">Partidos del Equipo</h3>
                  <ul className="mt-2 space-y-2">
                    {matchesForTeam.map(m => (
                      <li key={m.id} className="flex justify-between items-center border p-2 rounded">
                        <div>{m.equipoLocal.nombre} vs {m.equipoVisitante.nombre} — {new Date(m.fecha).toLocaleString()}</div>
                        <div className="space-x-2">
                          <Link href={`/reportes/${m.id}`} className="text-blue-600">Ver</Link>
                        </div>
                      </li>
                    ))}
                    {matchesForTeam.length === 0 && <li className="text-sm text-gray-500">No se encontraron partidos para este equipo.</li>}
                  </ul>
                  <div className="mt-4">
                    <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={async () => {
                      const ids = matchesForTeam.map(m => m.id);
                      if (ids.length === 0) return alert('No hay partidos para agregar');
                      const agg = await aggregateForMatches(ids);
                      alert(`Total: ${agg.total}\nAvg Vel: ${agg.avgVel ? agg.avgVel.toFixed(1) : 'N/A'}`);
                    }}>Ver estadísticas agregadas</button>
                  </div>
                </div>
              )}

            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
