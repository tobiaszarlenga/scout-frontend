// En: app/(private)/partidos/PartidosProgramados.tsx
'use client';

import React, { useState } from 'react';
import type { PartidoConDetalles } from 'types/partido';
import Link from 'next/link';
import { useScout } from '@/context/ScoutContext';
import { usePartidos } from '@/hooks/usePartidos';
import { format } from 'date-fns';
import EditPartidoModal from './EditPartidoModal';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import { Play, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

// 🎨 Paleta SoftScout (usa variables globales)
const COLORS = {
  rowBg: 'var(--color-card)',
  rowHover: 'var(--color-card)',
  text: 'var(--color-text)',
  accent: 'var(--color-accent)',
};

interface Props {
  partidos: PartidoConDetalles[];
}

export default function PartidosProgramados({ partidos }: Props) {
  const scout = useScout();
  const { remove } = usePartidos();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState<PartidoConDetalles | null>(null);

  const handleEdit = (p: PartidoConDetalles) => {
    setSelectedPartido(p);
    setEditOpen(true);
  };

  const handleDelete = (p: PartidoConDetalles) => {
    setSelectedPartido(p);
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedPartido) return;
    try {
      await remove.mutateAsync(selectedPartido.id);
      toast.success('Partido eliminado');
      setDeleteOpen(false);
      setSelectedPartido(null);
    } catch (error) {
      console.error('Error al eliminar partido:', error);
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    }
  };

  if (partidos.length === 0) {
    return (
      <p className="text-center py-4 text-apptext opacity-80">
        No hay partidos programados
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full text-left min-w-[700px] border-collapse">
          <thead>
            <tr style={{ backgroundColor: 'var(--color-card)', color: COLORS.text }}>
              <th className="py-2 px-4 font-medium">Fecha</th>
              <th className="py-2 px-4 font-medium">Horario</th>
              <th className="py-2 px-4 font-medium">Equipos</th>
              <th className="py-2 px-4 font-medium">Pitchers</th>
              <th className="py-2 px-4 font-medium">Campo</th>
              <th className="py-2 px-4 font-medium">Acciones</th>
            </tr>
          </thead>

        <tbody>
          {partidos.map((partido) => {
            const fechaHora = new Date(partido.fecha);

            return (
              <tr
                key={partido.id}
                className="transition-colors"
                style={{
                  backgroundColor: COLORS.rowBg,
                  color: COLORS.text,
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.rowHover)
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = COLORS.rowBg)
                }
              >
                <td className="py-3 px-4">{format(fechaHora, 'dd-MM-yyyy')}</td>
                <td className="py-3 px-4">{format(fechaHora, 'HH:mm')}</td>
                <td className="py-3 px-4">
                  {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
                </td>
                <td className="py-3 px-4 text-sm">
                  {partido.pitcherLocal.nombre} {partido.pitcherLocal.apellido}
                  <br />
                  {partido.pitcherVisitante.nombre} {partido.pitcherVisitante.apellido}
                </td>
                <td className="py-3 px-4">{partido.campo}</td>

                <td className="py-3 px-4 text-center w-36">
                  <div className="flex justify-center items-center gap-2">
                    <Link href={`/partidos/${partido.id}/scout`} className="rounded-full bg-orange-100 p-2 text-orange-600 hover:bg-orange-200" title={scout.getState(String(partido.id)) ? 'Continuar' : 'Empezar'}>
                      <Play size={16} />
                    </Link>

                    {!scout.getState(String(partido.id)) && (
                      <>
                        <button
                          onClick={() => handleEdit(partido)}
                          className="rounded-full bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                          aria-label="Editar"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(partido)}
                          className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
                          aria-label="Eliminar"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}

                    {scout.getState(String(partido.id)) && (
                      <span className="px-3 py-2 text-xs font-semibold rounded-lg" style={{ color: 'var(--color-accent)', backgroundColor: 'transparent' }}>
                        Partido en curso
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>

      {selectedPartido && (
        <EditPartidoModal open={editOpen} onClose={() => setEditOpen(false)} partido={selectedPartido} />
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Eliminar Partido"
        message={`¿Estás seguro de que deseas eliminar el partido entre ${selectedPartido?.equipoLocal?.nombre || 'local'} y ${selectedPartido?.equipoVisitante?.nombre || 'visitante'}?`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </>
  );
}

