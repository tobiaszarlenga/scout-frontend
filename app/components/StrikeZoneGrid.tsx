// En: app/components/StrikeZoneGrid.tsx
'use client';

import React from 'react';

// --- 1. Definimos las Props ---
// Le decimos a este componente que ESPERA recibir
// una función llamada 'onZoneClick' del padre.
interface StrikeZoneGridProps {
  onZoneClick: (zoneIndex: number) => void;
}

/**
 * Representa la cuadrícula interactiva de 5x5 (25 zonas).
 * Es un componente "controlado": informa al padre (página)
 * cuando se hace clic en una zona, pero no sabe qué pasa después.
 */
// --- 2. Usamos las Props ---
export default function StrikeZoneGrid({ onZoneClick }: StrikeZoneGridProps) {
  
  // (La lógica de zonas y strikeZoneIndices se queda igual)
  const zones = Array.from({ length: 25 });
  const strikeZoneIndices = [
    6, 7, 8,    // Fila 2
    11, 12, 13, // Fila 3
    16, 17, 18  // Fila 4
  ];

  // --- 3. ¡Borramos el 'handleZoneClick' de aquí! ---
  // (Ya no necesitamos la función que mostraba el 'alert()')

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Zona de Strike
      </h3>
      
      <div className="grid grid-cols-5 gap-1 bg-gray-400 p-1 rounded-lg shadow-inner">
        
        {zones.map((_, index) => {
          const isStrikeZone = strikeZoneIndices.includes(index);

          return (
            <button
              key={index}
              
              // --- 4. Conectamos el 'onClick' a la Prop ---
              // Cuando se hace clic, llamamos a la función
              // 'onZoneClick' que nos pasó el padre, y le
              // enviamos el 'index' de la zona clickeada.
              onClick={() => onZoneClick(index)}
              
              className={`
                w-14 h-14 md:w-16 md:h-16 
                transition-colors duration-150
                ${
                  isStrikeZone
                    ? 'bg-blue-100 border border-blue-300 hover:bg-blue-200'
                    : 'bg-white border border-gray-300 hover:bg-gray-100'
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
              `}
            >
              {/* Vacío */}
            </button>
          );
        })}
      </div>
      
      <p className="text-sm text-gray-500 mt-2">
        Centro: Strike Zone | Exterior: Bolas
      </p>
    </div>
  );
}