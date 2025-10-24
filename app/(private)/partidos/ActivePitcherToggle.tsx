// En: app/(private)/partidos/ActivePitcherToggle.tsx
'use client';

import React from 'react';

// --- CAMBIO 1: Definimos los tipos para las Props ---
// (Ya no usamos datos falsos ni 'useState' aquí)
type ActivePitcher = 'local' | 'visitante';

interface PitcherInfo {
  nombre: string;
  equipo: string;
}

interface ActivePitcherToggleProps {
  active: ActivePitcher;
  onToggle: (pitcher: ActivePitcher) => void;
  localPitcher: PitcherInfo;
  visitantePitcher: PitcherInfo;
}

export default function ActivePitcherToggle({
  // --- CAMBIO 2: Recibimos todo por props ---
  active,
  onToggle,
  localPitcher,
  visitantePitcher,
}: ActivePitcherToggleProps) {
  
  // (¡Hemos borrado el 'useState' de aquí!)

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-gray-500 font-semibold mb-3 text-sm">
        Pitcher Activo
      </h3>
      
      <div className="relative flex w-full bg-gray-200 rounded-full p-1">
        
        {/* El "deslizador" (ahora lee el 'active' de las props) */}
        <div 
          className={`
            absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-md 
            transition-transform duration-300 ease-in-out
            ${active === 'local' ? 'transform translate-x-0' : 'transform translate-x-full'}
          `}
        />
        
        {/* Botón Local */}
        <button
          // --- CAMBIO 3: Llama a la función 'onToggle' de las props ---
          onClick={() => onToggle('local')}
          className="relative z-10 w-1/2 py-2 text-center rounded-full text-sm font-semibold transition-colors"
          style={{ color: active === 'local' ? '#1D4ED8' : '#4B5563' }}
        >
          {localPitcher.nombre} ({localPitcher.equipo})
        </button>
        
        {/* Botón Visitante */}
        <button
          // --- CAMBIO 4: Llama a la función 'onToggle' de las props ---
          onClick={() => onToggle('visitante')}
          className="relative z-10 w-1/2 py-2 text-center rounded-full text-sm font-semibold transition-colors"
          style={{ color: active === 'visitante' ? '#1D4ED8' : '#4B5563' }}
        >
          {visitantePitcher.nombre} ({visitantePitcher.equipo})
        </button>
        
      </div>
      
      <div className="text-right mt-2">
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          Cambiar Pitcher (Relevo)
        </button>
      </div>
    </div>
  );
}