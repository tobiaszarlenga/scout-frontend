// En: app/(private)/partidos/[id]/scout/PitcherCard.tsx
'use client';

import React from 'react';

interface PitcherCardProps {
  nombre: string;
  equipo: string;
  cantidadLanzamientos: number;
  innings: string; // Ej: "1-2" o "3-5"
  onClick: () => void;
  tipo: 'local' | 'visitante'; // Para el color de la card
}

export default function PitcherCard({
  nombre,
  equipo,
  cantidadLanzamientos,
  innings,
  onClick,
  tipo
}: PitcherCardProps) {
  
  // Colores según el tipo
  const colorBorder = tipo === 'local' ? 'border-blue-400' : 'border-red-400';
  const colorHover = tipo === 'local' ? 'hover:border-blue-600' : 'hover:border-red-600';
  const colorBg = tipo === 'local' ? 'hover:bg-blue-50' : 'hover:bg-red-50';
  
  return (
    <div 
      onClick={onClick}
      className={`
        bg-white rounded-lg shadow-md border-2 ${colorBorder} 
        p-4 cursor-pointer transition-all duration-200
        ${colorHover} ${colorBg}
      `}
    >
      {/* Nombre del Pitcher */}
      <h3 className="text-lg font-bold text-gray-800 mb-1">
        {nombre}
      </h3>
      
      {/* Equipo (pequeño, arriba de las stats) */}
      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wide">
        {equipo}
      </p>
      
      {/* Información del pitcher */}
      <div className="space-y-1 text-sm text-gray-600">
        <p>
          <span className="font-semibold">Lanzamientos:</span> {cantidadLanzamientos}
        </p>
        <p>
          <span className="font-semibold">Innings:</span> {innings}
        </p>
      </div>
      
      {/* Indicador visual */}
      <div className="mt-3 text-xs text-gray-500 text-right">
        Click para ver detalles →
      </div>
    </div>
  );
}
