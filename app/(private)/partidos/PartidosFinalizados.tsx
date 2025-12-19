// scout-frontend/components/partidos/PartidosFinalizados.tsx
'use client';

import React, { useState } from 'react';
import type { PartidoConDetalles } from 'types/partido';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { usePartidos } from '@/hooks/usePartidos';
// Edit modal removed for finalized matches
import ConfirmDialog from '@/app/components/ConfirmDialog';
import { FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

// 🎨 Paleta SoftScout (usa variables globales)
const COLORS = {
  rowBg: 'var(--color-card)',
  rowHover: 'var(--color-card)',
  text: 'var(--color-text)',
  accent: 'var(--color-accent)', // Naranja principal
};

interface Props {
  partidos: PartidoConDetalles[];
}

export default function PartidosFinalizados({ partidos }: Props) {
  const router = useRouter();
  const { remove } = usePartidos();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedPartido, setSelectedPartido] = useState<PartidoConDetalles | null>(null);

  const handleVerReporte = (partidoId: number) => {
    router.push(`/reportes/${partidoId}`);
  };

  // Edit action removed for finalized matches

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
        No hay partidos finalizados
      </p>
    );
  }

  return (
    <>
      <div className="overflow-x-auto mt-6 rounded-lg">
        <table className="w-full text-left min-w-[700px] border-collapse">
        <thead>
            <tr style={{ backgroundColor: 'var(--color-card)', color: COLORS.text }}>
            <th className="py-2 px-4 font-medium">Fecha</th>
            <th className="py-2 px-4 font-medium">Equipos</th>
            <th className="py-2 px-4 font-medium">Pitchers</th>
            <th className="py-2 px-4 font-medium">Campo</th>
            <th className="py-2 px-4 font-medium w-32 text-center">Acción</th>
          </tr>
        </thead>

        <tbody>
          {partidos.map((partido) => (
            <tr
              key={partido.id}
              className="transition-colors group"
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
              <td className="py-3 px-4">
                {format(new Date(partido.fecha), 'dd-MM-yyyy')}
              </td>
              <td className="py-3 px-4">
                {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
              </td>
              <td className="py-3 px-4 text-sm">
                {partido.pitcherLocal.nombre} {partido.pitcherLocal.apellido}
                <br />
                {partido.pitcherVisitante.nombre} {partido.pitcherVisitante.apellido}
              </td>
              <td className="py-3 px-4">{partido.campo}</td>
              <td className="py-3 px-4 text-center w-32">
                <div className="flex justify-center items-center">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerReporte(partido.id)}
                      className="rounded-full bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
                      aria-label="Ver Reporte"
                      title="Ver Reporte"
                    >
                      <FileText size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(partido)}
                      className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
                      aria-label="Eliminar"
                      title="Eliminar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

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
