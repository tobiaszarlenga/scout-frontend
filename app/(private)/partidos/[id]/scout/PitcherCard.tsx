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
  
  // Colores según el tipo — mapeamos a variables temáticas
  const borderColorVar = tipo === 'local' ? 'var(--color-accent2)' : 'var(--color-accent)';

  return (
    <div
      onClick={onClick}
      className={"rounded-lg shadow-md border-2 p-4 cursor-pointer transition-all duration-200"}
      style={{
        backgroundColor: 'var(--color-card)',
        color: 'var(--color-text)',
        borderColor: borderColorVar,
      }}
    >
      {/* Nombre del Pitcher */}
      <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--color-text)' }}>
        {nombre}
      </h3>
      
      {/* Equipo (pequeño, arriba de las stats) */}
      <p className="text-xs mb-2 uppercase tracking-wide" style={{ color: 'var(--color-muted)' }}>
        {equipo}
      </p>
      
      {/* Información del pitcher */}
      <div className="space-y-1 text-sm" style={{ color: 'var(--color-muted)' }}>
        <p>
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Lanzamientos:</span> {cantidadLanzamientos}
        </p>
        <p>
          <span className="font-semibold" style={{ color: 'var(--color-text)' }}>Innings:</span> {innings}
        </p>
      </div>
      
      {/* Indicador visual */}
      <div className="mt-3 text-xs text-right" style={{ color: 'var(--color-muted)' }}>
        Click para ver detalles →
      </div>
    </div>
  );
}
