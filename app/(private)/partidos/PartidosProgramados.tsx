// En: app/(private)/partidos/PartidosProgramados.tsx
'use client';

import React from 'react';
import type { PartidoConDetalles } from 'types/partido';
import Link from 'next/link';
import { useScout } from '@/context/ScoutContext';
import { format } from 'date-fns';

// 🎨 Paleta SoftScout Dark Edition v2
const COLORS = {
  rowBg: '#22313F',
  rowHover: '#2C3E50',
  text: '#DDE2E5',
  accent: '#E04E0E',
};

interface Props {
  partidos: PartidoConDetalles[];
}

export default function PartidosProgramados({ partidos }: Props) {
  const scout = useScout();

  if (partidos.length === 0) {
    return (
      <p className="text-center py-4" style={{ color: '#AAB4BD' }}>
        No hay partidos programados
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg">
      <table className="w-full text-left min-w-[700px] border-collapse">
        <thead>
          <tr style={{ backgroundColor: '#1B2836', color: COLORS.text }}>
            <th className="py-2 px-4 font-medium">Fecha</th>
            <th className="py-2 px-4 font-medium">Horario</th>
            <th className="py-2 px-4 font-medium">Equipos</th>
            <th className="py-2 px-4 font-medium">Pitchers</th>
            <th className="py-2 px-4 font-medium">Campo</th>
            <th className="py-2 px-4 font-medium">Acción</th>
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

                <td className="py-3 px-4">
                  <Link
                    href={`/partidos/${partido.id}/scout`}
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
                    {scout.getState(String(partido.id)) ? 'Continuar' : 'Empezar'}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
