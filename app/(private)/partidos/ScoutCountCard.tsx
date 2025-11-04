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
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex flex-col justify-between h-full">
      
      {/* Título */}
      <h3 className="text-center text-gray-500 font-semibold mb-3">
        Cuenta
      </h3>
      
      {/* Cuerpo principal (Bolas y Strikes) */}
      <div className="flex items-start justify-around text-center mb-3">
        
        {/* Sección Bolas */}
        <div>
          <span className="text-6xl font-bold text-gray-800">
            {bolas}
          </span>
          <p className="text-lg text-gray-500">Bolas</p>
        </div>
        
        {/* Sección Strikes */}
        <div>
          <span className="text-6xl font-bold text-gray-800">
            {strikes}
          </span>
          <p className="text-lg text-gray-500">Strikes</p>
        </div>

      </div>

      {/* Botón de Reiniciar */}
      <div className="text-center">
        <button 
          onClick={onReset}
          className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
        >
          Reiniciar Cuenta
        </button>
      </div>
    </div>
  );
}