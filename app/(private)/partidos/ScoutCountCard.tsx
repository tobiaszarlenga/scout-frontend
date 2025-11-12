// En: app/(private)/partidos/ScoutCountCard.tsx
'use client';

import React from 'react';

/**
 * Tarjeta para mostrar la cuenta de Bolas y Strikes,
 * con un botón para reiniciar.
 */
interface ScoutCountCardProps {
  bolas: number;
  strikes: number;
  onReset: () => void;
}

export default function ScoutCountCard({ bolas, strikes, onReset }: ScoutCountCardProps) {

  return (
    // Tarjeta principal
    <div
      className="p-4 rounded-lg shadow-md flex flex-col justify-between h-full"
      style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
    >
      {/* Título */}
      <h3 className="text-center font-semibold mb-3" style={{ color: 'var(--color-muted)' }}>
        Cuenta
      </h3>
      
      {/* Cuerpo principal (Bolas y Strikes) */}
      <div className="flex items-start justify-around text-center mb-3">
        
        {/* Sección Bolas */}
        <div>
          <span className="text-6xl font-bold" style={{ color: 'var(--color-text)' }}>
            {bolas}
          </span>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>Bolas</p>
        </div>
        
        {/* Sección Strikes */}
        <div>
          <span className="text-6xl font-bold" style={{ color: 'var(--color-text)' }}>
            {strikes}
          </span>
          <p className="text-lg" style={{ color: 'var(--color-muted)' }}>Strikes</p>
        </div>

      </div>

      {/* Botón de Reiniciar */}
      <div className="text-center">
        <button
          onClick={onReset}
          className="text-sm hover:opacity-90 transition-colors"
          style={{ color: 'var(--color-accent)' }}
        >
          Reiniciar Cuenta
        </button>
      </div>
    </div>
  );
}