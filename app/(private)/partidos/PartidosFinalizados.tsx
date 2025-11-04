// scout-frontend/components/partidos/PartidosFinalizados.tsx
'use client'; // Necesario para useRouter

import React from 'react';
import type { PartidoConDetalles } from 'types/partido';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns'; // Recuerda: npm install date-fns

interface Props {
  partidos: PartidoConDetalles[];
}

export default function PartidosFinalizados({ partidos }: Props) {
  const router = useRouter();

  const handleVerReporte = (partidoId: number) => {
    // Navegar a la página de reporte
    router.push(`/reportes/${partidoId}`);
  };

  if (partidos.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No hay partidos finalizados
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[700px]">
        <thead>
          <tr className="border-b text-gray-600">
            <th className="py-2 px-4 font-medium">Fecha</th>
            <th className="py-2 px-4 font-medium">Equipos</th>
            <th className="py-2 px-4 font-medium">Pitchers</th>
            <th className="py-2 px-4 font-medium">Campo</th>
            <th className="py-2 px-4 font-medium">Estado</th>
            <th className="py-2 px-4 font-medium">Acción</th>
          </tr>
        </thead>
        <tbody>
          {partidos.map((partido) => (
            <tr key={partido.id} className="border-b hover:bg-gray-50 text-gray-800">
              {/* --- ¡AQUÍ ESTÁ LA CORRECCIÓN! --- */}
              {/* Convertimos el string a Date antes de formatear */}
              <td className="py-3 px-4">{format(new Date(partido.fecha), 'dd-MM-yyyy')}</td>
              <td className="py-3 px-4">
                {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
              </td>
              <td className="py-3 px-4 text-sm">
                {partido.pitcherLocal.nombre} {partido.pitcherLocal.apellido} <br />
                {partido.pitcherVisitante.nombre} {partido.pitcherVisitante.apellido}
              </td>
              <td className="py-3 px-4">{partido.campo}</td>
              <td className="py-3 px-4">
                <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                  Finalizado
                </span>
              </td>
              <td className="py-3 px-4">
                <button
                  onClick={() => handleVerReporte(partido.id)}
                  className="border border-gray-300 px-4 py-2 rounded-lg text-sm"
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