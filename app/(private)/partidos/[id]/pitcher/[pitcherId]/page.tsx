// En: app/(private)/partidos/[id]/pitcher/[pitcherId]/page.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import StrikeZoneGrid from '@/app/components/StrikeZoneGrid';
import { useLanzamientos } from '@/hooks/useLanzamientos';
import { useLookups } from '@/hooks/useLookups';
import { usePartido } from '@/hooks/usePartidos';
import type { LanzamientoDTO } from '@/lib/api';
import { Eye, Edit, Trash2 } from 'lucide-react';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import { toast } from 'react-hot-toast';

// Tipo para los lanzamientos procesados para la UI
interface Lanzamiento {
  id: number; // Ahora es el ID de BD
  inning: number;
  ladoInning: 'abre' | 'cierra';
  tipoId: number | null;
  tipoNombre: string;
  resultadoId: number | null;
  resultadoNombre: string;
  velocidad: number | null;
  zona: number;
  comentario: string | null;
  x: number;
  y: number;
}

interface PitcherDetalleProp {
  params: Promise<{ id: string; pitcherId: string }>;
}

export default function PitcherDetallePage({ params }: PitcherDetalleProp) {
  const router = useRouter();
  const { id: partidoId, pitcherId } = React.use(params);
  const { data: partido } = usePartido(partidoId);
  const { list: lanzamientosQuery, remove, update } = useLanzamientos(partidoId);
  const { tipos, resultados } = useLookups();
  
  // Estado para el modal de visualización de zona
  const [zonaSeleccionada, setZonaSeleccionada] = useState<number | null>(null);
  const [isModalZonaOpen, setIsModalZonaOpen] = useState(false);
  
  // Convertir zona x,y a índice 0-24
  const xyToZona = (x: number, y: number): number => {
    return y * 5 + x;
  };

  // Filtrar lanzamientos del pitcher y procesar
  const lanzamientos: Lanzamiento[] = useMemo(() => {
    if (!lanzamientosQuery.data) return [];
    
    const lista = lanzamientosQuery.data.filter(l => l.pitcherId === Number(pitcherId));
    
    // Resolver nombres de lookups
    const nameTipo = (id: number | null) => {
      if (!id || !tipos.data) return '';
      return tipos.data.find(t => t.id === id)?.nombre ?? '';
    };
    const nameResultado = (id: number | null) => {
      if (!id || !resultados.data) return '';
      return resultados.data.find(r => r.id === id)?.nombre ?? '';
    };
    
    return lista.map((l: LanzamientoDTO) => ({
      id: l.id,
      inning: l.inning,
      ladoInning: l.ladoInning as 'abre' | 'cierra',
      tipoId: l.tipoId,
      tipoNombre: nameTipo(l.tipoId),
      resultadoId: l.resultadoId,
      resultadoNombre: nameResultado(l.resultadoId),
      velocidad: l.velocidad,
      zona: xyToZona(l.x, l.y),
      comentario: l.comentario,
      x: l.x,
      y: l.y,
    }));
  }, [lanzamientosQuery.data, pitcherId, tipos.data, resultados.data]);
  
  // Obtener info del pitcher desde los datos del partido
  const pitcherInfo = useMemo(() => {
    if (!partido) return null;
    
    // Buscar en los pitchers iniciales
    if (partido.pitcherLocal.id === Number(pitcherId)) {
      return {
        nombre: `${partido.pitcherLocal.nombre} ${partido.pitcherLocal.apellido}`,
        equipo: partido.equipoLocal.nombre,
      };
    }
    if (partido.pitcherVisitante.id === Number(pitcherId)) {
      return {
        nombre: `${partido.pitcherVisitante.nombre} ${partido.pitcherVisitante.apellido}`,
        equipo: partido.equipoVisitante.nombre,
      };
    }
    
    // Buscar en todos los pitchers de ambos equipos
    const allPitchers = [
      ...partido.equipoLocal.pitchers.map(p => ({ ...p, equipo: partido.equipoLocal.nombre })),
      ...partido.equipoVisitante.pitchers.map(p => ({ ...p, equipo: partido.equipoVisitante.nombre })),
    ];
    
    const found = allPitchers.find(p => p.id === Number(pitcherId));
    if (found) {
      return {
        nombre: `${found.nombre} ${found.apellido}`,
        equipo: found.equipo,
      };
    }
    
    return null;
  }, [partido, pitcherId]);
  
  const pitcherNombre = pitcherInfo?.nombre ?? `Pitcher #${pitcherId}`;
  const equipoNombre = pitcherInfo?.equipo ?? '';
  
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
  
  const handleEditar = (lanzamientoId: number) => {
    openEditModalFor(lanzamientoId);
  };
  
  const handleEliminar = async (lanzamientoId: number) => {
    // Abrir confirmación modal (se maneja más abajo)
    setLanzamientoAEliminar(lanzamientoId);
  };

  const [lanzamientoAEliminar, setLanzamientoAEliminar] = useState<number | null>(null);

  const confirmDeleteLanzamiento = async () => {
    if (!lanzamientoAEliminar) return;
    try {
      await remove.mutateAsync(lanzamientoAEliminar);
      toast.success('Lanzamiento eliminado');
      setLanzamientoAEliminar(null);
    } catch (err) {
      console.error('Error al eliminar lanzamiento:', err);
      const errorMessage = err instanceof Error ? err.message : 'No se pudo eliminar el lanzamiento.';
      toast.error(errorMessage);
      setLanzamientoAEliminar(null);
    }
  };

  // --- Estados para edición ---
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTipoId, setEditTipoId] = useState<number | null>(null);
  const [editResultadoId, setEditResultadoId] = useState<number | null>(null);
  const [editVelocidad, setEditVelocidad] = useState<number | null>(null);

  const openEditModalFor = (lanzamientoId: number) => {
    const found = lanzamientos.find(l => l.id === lanzamientoId);
    if (!found) return;
    setEditingId(lanzamientoId);
    setEditTipoId(found.tipoId);
    setEditResultadoId(found.resultadoId);
    setEditVelocidad(found.velocidad);
    setIsEditModalOpen(true);
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      await update.mutateAsync({
        id: editingId,
        data: {
          tipoId: editTipoId ?? undefined,
          resultadoId: editResultadoId ?? undefined,
          velocidad: editVelocidad ?? undefined,
        },
      });
      console.log('✅ Lanzamiento actualizado');
      setIsEditModalOpen(false);
      setEditingId(null);
    } catch (err) {
      console.error('Error al actualizar lanzamiento:', err);
      const errorMessage = err instanceof Error ? err.message : 'No se pudo actualizar el lanzamiento. Intenta de nuevo.';
      toast.error(errorMessage);
    }
  };


  return (
    <main
      className="min-h-full w-full max-w-full overflow-x-hidden px-6 py-6 sm:px-10 sm:py-8"
      style={{ background: `linear-gradient(160deg, var(--color-bg), var(--color-sidebar))`, color: 'var(--color-text)' }}
    >
      <div className="mx-auto w-full max-w-6xl">
        
        {/* Cabecera */}
        <header className="pb-8">
          <button
            onClick={() => router.back()}
            className="text-sm hover:opacity-80 mb-4"
            style={{ color: 'var(--color-muted)' }}
          >
            &larr; Volver al Scout
          </button>
          <div className="backdrop-blur-sm rounded-lg p-6" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
            <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
              {pitcherNombre}
            </h1>
            <p className="text-xl" style={{ color: 'var(--color-muted)' }}>
              {equipoNombre}
            </p>
            <div className="mt-4 flex gap-4" style={{ color: 'var(--color-text)' }}>
              <div style={{ backgroundColor: `rgba(var(--color-text-rgb),0.06)`, padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Total Lanzamientos:</span>
                <span className="ml-2 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{lanzamientos.length}</span>
              </div>
              <div style={{ backgroundColor: `rgba(var(--color-text-rgb),0.06)`, padding: '0.5rem 1rem', borderRadius: '0.5rem' }}>
                <span className="text-sm" style={{ color: 'var(--color-muted)' }}>Innings:</span>
                <span className="ml-2 text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{innings.length}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido Principal */}
  <div className="rounded-lg shadow-xl p-6" style={{ backgroundColor: 'var(--color-card)' }}>
          
            {lanzamientos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg" style={{ color: 'var(--color-muted)' }}>
                Este pitcher aún no ha registrado lanzamientos
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {innings.map(inningKey => {
                const [inning, lado] = inningKey.split('-');
                const lanzamientosInning = lanzamientosPorInning[inningKey];
                
                return (
                  <section key={inningKey} className="border-b pb-6 last:border-b-0" style={{ borderColor: 'var(--color-border)' }}>
                    <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--color-text)' }}>
                      Inning {inning} ({lado === 'abre' ? 'Abre' : 'Cierra'})
                    </h2>
                    
                    {/* Tabla de lanzamientos */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead style={{ backgroundColor: 'rgba(var(--color-text-rgb),0.04)' }}>
                          <tr>
                            <th className="px-4 py-2 text-left">#</th>
                            <th className="px-4 py-2 text-left">Tipo</th>
                            <th className="px-4 py-2 text-left">Resultado</th>
                            <th className="px-4 py-2 text-left">Velocidad</th>
                            <th className="px-4 py-2 text-left">Zona</th>
                            <th className="px-4 py-2 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {lanzamientosInning.map((lanzamiento, index) => {
                            // badge colors using theme vars (fallback hex if needed)
                            const badge = (() => {
                              const name = (lanzamiento.resultadoNombre || '').toUpperCase();
                                if (name === 'STRIKE') return { bg: `rgba(var(--color-danger-rgb),0.12)`, color: 'var(--color-danger)' };
                                if (name === 'BOLA') return { bg: `rgba(var(--color-accent2-rgb),0.12)`, color: 'var(--color-accent2)' };
                                if (name === 'HIT') return { bg: `rgba(var(--color-success-rgb),0.12)`, color: 'var(--color-success)' };
                                if (name === 'OUT') return { bg: `rgba(var(--color-text-rgb),0.06)`, color: 'var(--color-muted)' };
                                return { bg: `rgba(var(--color-accent-rgb),0.12)`, color: 'var(--color-accent)' };
                            })();

                            return (
                              <tr key={lanzamiento.id} className="border-b" style={{ borderColor: 'var(--color-border)' }}>
                                <td className="px-4 py-3 font-medium">{index + 1}</td>
                                <td className="px-4 py-3">{lanzamiento.tipoNombre || '-'}</td>
                                <td className="px-4 py-3">
                                  <span className="px-2 py-1 rounded text-xs font-semibold" style={{ background: badge.bg, color: badge.color }}>
                                    {lanzamiento.resultadoNombre || '-'}
                                  </span>
                                </td>
                                <td className="px-4 py-3">{lanzamiento.velocidad ? `${lanzamiento.velocidad} km/h` : '-'}</td>
                                <td className="px-4 py-3">{lanzamiento.zona}</td>
                                <td className="px-4 py-3 text-center">
                                  <div className="flex justify-center gap-2">
                                    <button
                                      type="button"
                                      onClick={() => handleVerZona(lanzamiento.zona)}
                                      className="rounded-full bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                                      aria-label={`Ver lanzamiento ${index + 1}`}
                                      title="Ver"
                                    >
                                      <Eye size={16} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleEditar(lanzamiento.id)}
                                      className="rounded-full bg-orange-100 p-2 text-orange-600 hover:bg-orange-200"
                                      aria-label={`Editar lanzamiento ${index + 1}`}
                                      title="Editar"
                                    >
                                      <Edit size={16} />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleEliminar(lanzamiento.id)}
                                      className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
                                      aria-label={`Eliminar lanzamiento ${index + 1}`}
                                      title="Eliminar"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
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
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => setIsModalZonaOpen(false)}
            // overlay ligado a tokens de globals.css (con fallback)
            style={{ backgroundColor: 'var(--color-overlay, rgba(0,0,0,0.5))' }}
          >
            <div 
              className="rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              // panel usa variables de tema para fondo, texto y borde
              style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Zona del Lanzamiento</h3>
                <button
                  onClick={() => setIsModalZonaOpen(false)}
                  className="hover:opacity-80"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label="Cerrar modal zona"
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
                  className="px-4 py-2 rounded hover:opacity-90"
                  style={{ backgroundColor: 'rgba(var(--color-text-rgb),0.04)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
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
            className="fixed inset-0 flex items-center justify-center z-50"
            onClick={() => setIsEditModalOpen(false)}
            style={{ backgroundColor: 'var(--color-overlay, rgba(0,0,0,0.5))' }}
          >
            <div
              className="rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
              style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>Editar Lanzamiento</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="hover:opacity-80"
                  style={{ color: 'var(--color-muted)' }}
                  aria-label="Cerrar modal editar"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium" style={{ color: 'var(--color-muted)' }}>Tipo</label>
                  <select
                    value={editTipoId ?? ''}
                    onChange={(e) => setEditTipoId(e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 block w-full rounded-md sm:text-sm"
                    style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="">Seleccionar tipo</option>
                    {tipos.data?.map(t => (
                      <option key={t.id} value={t.id}>{t.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: 'var(--color-muted)' }}>Resultado</label>
                  <select
                    value={editResultadoId ?? ''}
                    onChange={(e) => setEditResultadoId(e.target.value ? Number(e.target.value) : null)}
                    className="mt-1 block w-full rounded-md sm:text-sm"
                    style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  >
                    <option value="">Seleccionar resultado</option>
                    {resultados.data?.map(r => (
                      <option key={r.id} value={r.id}>{r.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium" style={{ color: 'var(--color-muted)' }}>Velocidad (km/h)</label>
                  <input
                    type="number"
                    value={editVelocidad ?? ''}
                    onChange={(e) => setEditVelocidad(e.target.valueAsNumber || null)}
                    className="mt-1 block w-full rounded-md sm:text-sm"
                    style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded hover:opacity-90"
                    style={{ backgroundColor: 'rgba(var(--color-text-rgb),0.04)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-2 rounded hover:opacity-95"
                    style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-on-accent)', border: '1px solid rgba(0,0,0,0.05)' }}
                  >
                    Guardar
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

        <ConfirmDialog
          open={lanzamientoAEliminar !== null}
          title="Eliminar Lanzamiento"
          message={`¿Eliminar este lanzamiento? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={confirmDeleteLanzamiento}
          onCancel={() => setLanzamientoAEliminar(null)}
        />
    </main>
  );
}
