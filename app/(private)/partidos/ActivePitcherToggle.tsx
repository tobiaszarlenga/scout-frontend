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
  onCambiarPitcher: (tipo: ActivePitcher) => void; // Nueva prop para cambiar pitcher
}

export default function ActivePitcherToggle({
  // --- CAMBIO 2: Recibimos todo por props ---
  active,
  onToggle,
  localPitcher,
  visitantePitcher,
  onCambiarPitcher,
}: ActivePitcherToggleProps) {
  
  // (¡Hemos borrado el 'useState' de aquí!)

  return (
    <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      <h3 className="font-semibold mb-3 text-sm" style={{ color: 'var(--color-muted)' }}>
        Pitcher Activo
      </h3>

      <div className="relative flex w-full rounded-full p-1" style={{ backgroundColor: 'rgba(var(--color-text-rgb),0.04)' }}>
        
        {/* El "deslizador" (ahora lee el 'active' de las props) */}
        <div
          className={`absolute top-1 bottom-1 w-1/2 rounded-full shadow-md transition-transform duration-300 ease-in-out ${
            active === 'local' ? 'transform translate-x-0' : 'transform translate-x-full'
          }`}
          style={{ backgroundColor: 'rgba(var(--color-text-rgb),0.08)' }}
        />
        
        {/* Botón Local */}
        <button
          onClick={() => onToggle('local')}
          className="relative z-10 w-1/2 py-2 text-center rounded-full text-sm font-semibold transition-colors"
          style={{ color: active === 'local' ? 'var(--color-text)' : 'var(--color-muted)' }}
        >
          {localPitcher.nombre} ({localPitcher.equipo})
        </button>
        
        {/* Botón Visitante */}
        <button
          onClick={() => onToggle('visitante')}
          className="relative z-10 w-1/2 py-2 text-center rounded-full text-sm font-semibold transition-colors"
          style={{ color: active === 'visitante' ? 'var(--color-text)' : 'var(--color-muted)' }}
        >
          {visitantePitcher.nombre} ({visitantePitcher.equipo})
        </button>
        
      </div>
      
      <div className="text-right mt-2">
        <button
          onClick={() => onCambiarPitcher(active)}
          className="text-xs font-medium hover:opacity-90"
          style={{ color: 'var(--color-accent)' }}
        >
          Cambiar Pitcher (Relevo)
        </button>
      </div>
    </div>
  );
}