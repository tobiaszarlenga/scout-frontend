'use client';

import React from 'react';
import type { PartidoConDetalles } from 'types/partido';
import { useRouter } from 'next/navigation';
// ¡Asegúrate de tener date-fns instalado! (npm install date-fns)
import { format } from 'date-fns';

interface Props {
  // Esto ya está perfecto
  partidos: PartidoConDetalles[];
}

export default function PartidosProgramados({ partidos }: Props) {
  const router = useRouter();

  const handleEmpezar = (partidoId: number) => {
    console.log(`Empezar partido ${partidoId}`);
    // router.push(`/partidos/${partidoId}/scout`);
  };

  if (partidos.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4">
        No hay partidos programados
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left min-w-[700px]">
        <thead>
          <tr className="border-b text-gray-600">
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
            // Creamos el objeto Date una sola vez para usarlo en ambos campos
            const fechaHora = new Date(partido.fecha);

            return (
              <tr key={partido.id} className="border-b hover:bg-gray-50 text-gray-800">
                {/* --- SOLUCIÓN 1 --- */}
                {/* Convertimos el string a Date ANTES de formatear */}
                <td className="py-3 px-4">{format(fechaHora, 'dd-MM-yyyy')}</td>
                
                {/* --- SOLUCIÓN 2 --- */}
                {/* Extraemos la hora (HH:mm) del mismo objeto Date */}
                <td className="py-3 px-4">{format(fechaHora, 'HH:mm')}</td>
                
                <td className="py-3 px-4">
                  {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
                </td>
                <td className="py-3 px-4 text-sm">
                  {partido.pitcherLocal.nombre} {partido.pitcherLocal.apellido} <br />
                  {partido.pitcherVisitante.nombre} {partido.pitcherVisitante.apellido}
                </td>
                <td className="py-3 px-4">{partido.campo}</td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => handleEmpezar(partido.id)}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Empezar
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}