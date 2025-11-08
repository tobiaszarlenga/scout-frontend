// scout-frontend/components/partidos/PartidosFinalizados.tsx
'use client';

import React from 'react';
import type { PartidoConDetalles } from 'types/partido';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

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

  const handleVerReporte = (partidoId: number) => {
    router.push(`/reportes/${partidoId}`);
  };

  if (partidos.length === 0) {
    return (
      <p className="text-center py-4 text-apptext opacity-80">
        No hay partidos finalizados
      </p>
    );
  }

  return (
    <div className="overflow-x-auto mt-6 rounded-lg">
      <table className="w-full text-left min-w-[700px] border-collapse">
        <thead>
          <tr style={{ backgroundColor: 'var(--color-card)', color: COLORS.text }}>
            <th className="py-2 px-4 font-medium">Fecha</th>
            <th className="py-2 px-4 font-medium">Equipos</th>
            <th className="py-2 px-4 font-medium">Pitchers</th>
            <th className="py-2 px-4 font-medium">Campo</th>
            <th className="py-2 px-4 font-medium">Acción</th>
          </tr>
        </thead>

        <tbody>
          {partidos.map((partido) => (
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
              <td className="py-3 px-4">
                <button
                  onClick={() => handleVerReporte(partido.id)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                  style={{
                    backgroundColor: COLORS.accent,
                    color: COLORS.text,
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = '#C7430D')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = COLORS.accent)
                  }
                >
                  Ver Reporte
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
