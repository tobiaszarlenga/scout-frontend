// En: app/(private)/partidos/[id]/pitcher/[pitcherId]/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import StrikeZoneGrid from '@/app/components/StrikeZoneGrid';
import { useScout } from '@/context/ScoutContext';
import type { LanzamientoGuardado } from '@/types/scout';
import { useLookups } from '@/hooks/useLookups';

// Tipo para los lanzamientos (temporal, luego vendrá de la API)
interface Lanzamiento {
  id: string;
  inning: number;
  ladoInning: 'abre' | 'cierra';
  tipoId: number | null;
  tipoNombre: string;
  resultadoId: number | null;
  resultadoNombre: string;
  velocidad: number | null;
  zona: number;
  comentario: string | null;
  timestamp: Date;
}

interface PitcherDetalleProp {
  params: Promise<{ id: string; pitcherId: string }>;
}

export default function PitcherDetallePage({ params }: PitcherDetalleProp) {
  const router = useRouter();
  const { id: partidoId, pitcherId } = React.use(params);
  const scout = useScout();
  const { tipos, resultados } = useLookups();
  
  // Estado para el modal de visualización de zona
  const [zonaSeleccionada, setZonaSeleccionada] = useState<number | null>(null);
  const [isModalZonaOpen, setIsModalZonaOpen] = useState(false);
  
  // Obtener estado del partido desde el contexto
  const state = scout.getState(partidoId);
  const pitcher = state?.pitchersEnPartido.find(p => p.id === String(pitcherId));
  const pitcherNombre = pitcher?.nombre ?? 'Pitcher';
  const equipoNombre = pitcher?.equipo ?? '';

  console.log('🎯 PitcherDetallePage:', { 
    partidoId, 
    pitcherId, 
    state, 
    pitcher,
    totalLanzamientos: state?.lanzamientos.length ?? 0,
    lanzamientosDelPitcher: state?.lanzamientos.filter(l => l.pitcherId === String(pitcherId)).length ?? 0
  });

  // Filtrar lanzamientos del pitcher
  const lanzamientos: Lanzamiento[] = useMemo(() => {
    const lista = (state?.lanzamientos ?? []).filter(l => l.pitcherId === String(pitcherId));
    // Resolver nombres de lookups
    const nameTipo = (id: number | null) => {
      if (!id || !tipos.data) return '';
      return tipos.data.find(t => t.id === id)?.nombre ?? '';
    };
    const nameResultado = (id: number | null) => {
      if (!id || !resultados.data) return '';
      return resultados.data.find(r => r.id === id)?.nombre ?? '';
    };
    return lista.map((l: LanzamientoGuardado) => ({
      id: `${l.pitcherId}-${l.timestamp.toString()}-${l.zona}`,
      inning: l.inning,
      ladoInning: l.ladoInning,
      tipoId: l.tipoId ?? null,
      tipoNombre: nameTipo(l.tipoId ?? null),
      resultadoId: l.resultadoId ?? null,
      resultadoNombre: nameResultado(l.resultadoId ?? null),
      velocidad: l.velocidad ?? null,
      zona: l.zona,
  comentario: null,
      timestamp: l.timestamp,
    }));
  }, [state?.lanzamientos, pitcherId, tipos.data, resultados.data]);
  
  // Agrupar lanzamientos por inning
  const lanzamientosPorInning = lanzamientos.reduce((acc, lanzamiento) => {
    const key = `${lanzamiento.inning}-${lanzamiento.ladoInning}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(lanzamiento);
    return acc;
  }, {} as Record<string, Lanzamiento[]>);
  
  // Obtener innings únicos ordenados
  const innings = Object.keys(lanzamientosPorInning).sort((a, b) => {
    const [inningA, ladoA] = a.split('-');
    const [inningB] = b.split('-');
    if (inningA !== inningB) return Number(inningA) - Number(inningB);
    return ladoA === 'abre' ? -1 : 1;
  });
  
  const handleVerZona = (zona: number) => {
    setZonaSeleccionada(zona);
    setIsModalZonaOpen(true);
  };
  
  const handleEditar = (lanzamientoId: string) => {
    openEditModalFor(lanzamientoId);
  };
  
  const handleEliminar = (lanzamientoId: string) => {
    confirmDelete(lanzamientoId);
  };

  // --- Estados para edición ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTipoId, setEditTipoId] = useState<number | null>(null);
  const [editResultadoId, setEditResultadoId] = useState<number | null>(null);
  const [editVelocidad, setEditVelocidad] = useState<number | null>(null);

  // Helper para generar el id interno igual que en el map
  const genIdFrom = (l: LanzamientoGuardado) => `${l.pitcherId}-${l.timestamp.toString()}-${l.zona}`;

  const openEditModalFor = (lanzamientoId: string) => {
    // Encontrar el lanzamiento en el estado global
  const s = scout.getState(partidoId);
  const found = s?.lanzamientos.find((l: LanzamientoGuardado) => genIdFrom(l) === lanzamientoId);
    if (!found) return;
    setEditingId(lanzamientoId);
    setEditTipoId(found.tipoId ?? null);
    setEditResultadoId(found.resultadoId ?? null);
    setEditVelocidad(found.velocidad ?? null);
    setIsEditModalOpen(true);
  };

  const saveEdit = () => {
    if (!editingId) return;
    const s = scout.getState(partidoId);
    if (!s) return;
    const updated = s.lanzamientos.map((l: LanzamientoGuardado) => {
      if (genIdFrom(l) === editingId) {
        return {
          ...l,
          tipoId: editTipoId ?? null,
          resultadoId: editResultadoId ?? null,
          velocidad: editVelocidad ?? null,
        } as LanzamientoGuardado;
      }
      return l;
    });
    // Persistir en el contexto
    // conservamos pitchersEnPartido
    const newState = { lanzamientos: updated, pitchersEnPartido: s.pitchersEnPartido };
    scout.setStateForPartido(partidoId, newState);
    setIsEditModalOpen(false);
    setEditingId(null);
  };

  const confirmDelete = (lanzamientoId: string) => {
    if (!confirm('¿Eliminar este lanzamiento? Esta acción no se puede deshacer (solo localmente).')) return;
  const s = scout.getState(partidoId);
  if (!s) return;
  const filtered = s.lanzamientos.filter((l: LanzamientoGuardado) => genIdFrom(l) !== lanzamientoId);
    const newState = { lanzamientos: filtered, pitchersEnPartido: s.pitchersEnPartido };
    scout.setStateForPartido(partidoId, newState);
  };


  return (
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        
        {/* Cabecera */}
        <header className="pb-8">
          <button 
            onClick={() => router.back()}
            className="text-sm text-gray-200 hover:text-white mb-4"
          >
            &larr; Volver al Scout
          </button>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {pitcherNombre}
            </h1>
            <p className="text-xl text-gray-200">
              {equipoNombre}
            </p>
            <div className="mt-4 flex gap-4 text-white">
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm opacity-80">Total Lanzamientos:</span>
                <span className="ml-2 text-2xl font-bold">{lanzamientos.length}</span>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-lg">
                <span className="text-sm opacity-80">Innings:</span>
                <span className="ml-2 text-2xl font-bold">{innings.length}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido Principal */}
        <div className="bg-white rounded-lg shadow-xl p-6">
          
          {lanzamientos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                Este pitcher aún no ha registrado lanzamientos
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {innings.map(inningKey => {
                const [inning, lado] = inningKey.split('-');
                const lanzamientosInning = lanzamientosPorInning[inningKey];
                
                return (
                  <section key={inningKey} className="border-b pb-6 last:border-b-0">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">
                      Inning {inning} ({lado === 'abre' ? 'Abre' : 'Cierra'})
                    </h2>
                    
                    {/* Tabla de lanzamientos */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-2 text-left">#</th>
                            <th className="px-4 py-2 text-left">Tipo</th>
                            <th className="px-4 py-2 text-left">Resultado</th>
                            <th className="px-4 py-2 text-left">Velocidad</th>
                            <th className="px-4 py-2 text-left">Zona</th>
                            <th className="px-4 py-2 text-left">Comentario</th>
                            <th className="px-4 py-2 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lanzamientosInning.map((lanzamiento, index) => (
                            <tr key={lanzamiento.id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium">{index + 1}</td>
                              <td className="px-4 py-3">{lanzamiento.tipoNombre || '-'}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  lanzamiento.resultadoNombre === 'STRIKE' ? 'bg-red-100 text-red-800' :
                                  lanzamiento.resultadoNombre === 'BOLA' ? 'bg-blue-100 text-blue-800' :
                                  lanzamiento.resultadoNombre === 'HIT' ? 'bg-green-100 text-green-800' :
                                  lanzamiento.resultadoNombre === 'OUT' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {lanzamiento.resultadoNombre || '-'}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {lanzamiento.velocidad ? `${lanzamiento.velocidad} km/h` : '-'}
                              </td>
                              <td className="px-4 py-3">{lanzamiento.zona}</td>
                              <td className="px-4 py-3 max-w-xs truncate">
                                {lanzamiento.comentario || '-'}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleVerZona(lanzamiento.zona)}
                                    className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                  >
                                    Ver
                                  </button>
                                  <button
                                    onClick={() => handleEditar(lanzamiento.id)}
                                    className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                                  >
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleEliminar(lanzamiento.id)}
                                    className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal para visualizar zona de strike */}
        {isModalZonaOpen && zonaSeleccionada !== null && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsModalZonaOpen(false)}
          >
            <div 
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Zona del Lanzamiento</h3>
                <button
                  onClick={() => setIsModalZonaOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="flex justify-center">
                <StrikeZoneGrid 
                  onZoneClick={() => {}} 
                  highlightedZone={zonaSeleccionada}
                  readOnly={true}
                />
              </div>
              <div className="mt-4 text-center">
                <button
                  onClick={() => setIsModalZonaOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para editar lanzamiento */}
        {isEditModalOpen && editingId && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setIsEditModalOpen(false)}
          >
            <div
              className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Editar Lanzamiento</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo</label>
                  <select
                    value={editTipoId ?? ''}
                    onChange={(e) => setEditTipoId(e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                  >
                    <option value="">Seleccionar tipo</option>
                    {tipos.data?.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Resultado</label>
                  <select
                    value={editResultadoId ?? ''}
                    onChange={(e) => setEditResultadoId(e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                  >
                    <option value="">Seleccionar resultado</option>
                    {resultados.data?.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Velocidad (km/h)</label>
                  <input
                    type="number"
                    value={editVelocidad ?? ''}
                    onChange={(e) => setEditVelocidad(e.target.valueAsNumber || null)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Guardar
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </main>
  );
}
