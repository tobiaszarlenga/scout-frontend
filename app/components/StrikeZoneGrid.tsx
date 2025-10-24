// En: app/components/StrikeZoneGrid.tsx
'use client';

import React from 'react';

/**
 * Representa la cuadrícula interactiva de 5x5 (25 zonas) para
 * registrar lanzamientos.
 */
export default function StrikeZoneGrid() {
  
  // --- 1. Definición de Zonas ---
  
  // Creamos un array de 25 elementos (0 al 24) para mapear
  const zones = Array.from({ length: 25 });

  // Definimos los índices (0-24) que son parte de la
  // zona de strike interna (el 3x3 del centro)
  const strikeZoneIndices = [
    6, 7, 8,    // Fila 2
    11, 12, 13, // Fila 3
    16, 17, 18  // Fila 4
  ];

  // --- 2. Manejador de Clic ---
  
  /**
   * Se llama cuando el scout hace clic en una de las 25 zonas.
   * @param zoneIndex El índice del 0 al 24 de la zona clickeada.
   */
  const handleZoneClick = (zoneIndex: number) => {
    // Por ahora, solo mostramos una alerta.
    // Más adelante, aquí abriremos el Modal para "Registrar Lanzamiento"
    // pasándole la información de la zona.
    console.log(`Clic en la zona ${zoneIndex}`);
    alert(`Clic en la zona ${zoneIndex}`);
  };

  // --- 3. Renderizado del Componente ---
  
  return (
    <div className="flex flex-col items-center">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">
        Zona de Strike
      </h3>
      
      {/* Contenedor de la Cuadrícula:
        - `grid`: Habilita CSS Grid
        - `grid-cols-5`: Define 5 columnas de igual tamaño.
        - `gap-1`: Un pequeño espacio (1px) entre cada celda.
        - `bg-gray-400`: Color de fondo para el "gap", simula un borde.
        - `p-1 rounded-lg`: Un pequeño padding y bordes redondeados.
        - `shadow-inner`: Sombra interna para darle profundidad.
      */}
      <div className="grid grid-cols-5 gap-1 bg-gray-400 p-1 rounded-lg shadow-inner">
        
        {zones.map((_, index) => {
          
          // Verificamos si este 'index' está en nuestro array de strikeZoneIndices
          const isStrikeZone = strikeZoneIndices.includes(index);

          return (
            <button
              key={index}
              onClick={() => handleZoneClick(index)}
              // --- Estilos Dinámicos ---
              // Aplicamos un estilo diferente si es zona de strike o no.
              className={`
                w-14 h-14 md:w-16 md:h-16 
                transition-colors duration-150
                ${
                  isStrikeZone
                    ? 'bg-blue-100 border border-blue-300 hover:bg-blue-200' // Estilo Strike (azul)
                    : 'bg-white border border-gray-300 hover:bg-gray-100'   // Estilo Bola (blanco)
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:z-10
              `}
            >
              {/* El cuadrado está vacío, solo es un botón de clic */}
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