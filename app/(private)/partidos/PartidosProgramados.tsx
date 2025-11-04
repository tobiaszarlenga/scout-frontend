// En: app/(private)/partidos/PartidosProgramados.tsx
'use client';

import React from 'react';
import type { PartidoConDetalles } from 'types/partido';
// --- CAMBIO 1: Importamos Link ---
import Link from 'next/link'; 
// (Ya no necesitamos useRouter)
import { format } from 'date-fns';

interface Props {
  partidos: PartidoConDetalles[];
}

export default function PartidosProgramados({ partidos }: Props) {
  
  // --- CAMBIO 2: Ya no necesitamos la función handleEmpezar ---
  // const handleEmpezar = (partidoId: number) => {
  //   console.log(`Empezar partido ${partidoId}`);
  
  // };

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
          {/* ... (tu <thead> no cambia) ... */}
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
            const fechaHora = new Date(partido.fecha);

            return (
              <tr key={partido.id} className="border-b hover:bg-gray-50 text-gray-800">
                
                {/* ... (las otras celdas <td> no cambian) ... */}
                <td className="py-3 px-4">{format(fechaHora, 'dd-MM-yyyy')}</td>
                <td className="py-3 px-4">{format(fechaHora, 'HH:mm')}</td>
                <td className="py-3 px-4">
                  {partido.equipoLocal.nombre} vs {partido.equipoVisitante.nombre}
                </td>
                <td className="py-3 px-4 text-sm">
                  {partido.pitcherLocal.nombre} {partido.pitcherLocal.apellido} <br />
                  {partido.pitcherVisitante.nombre} {partido.pitcherVisitante.apellido}
                </td>
                <td className="py-3 px-4">{partido.campo}</td>
                
                {/* --- CAMBIO 3: Reemplazamos <button> por <Link> --- */}
                <td className="py-3 px-4">
                  <Link
                    href={`/partidos/${partido.id}/scout`}
                    className="bg-gray-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-900 transition-colors"
                  >
                    Empezar
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