// En: app/(private)/partidos/ActivePitcherToggle.tsx
'use client';

import React, { useState } from 'react';

// 1. Definimos los datos falsos (luego los recibiremos por props)
const fakePitcherLocal = { nombre: 'Laura Fernández', equipo: 'Leones' };
const fakePitcherVisitante = { nombre: 'Juan Pérez', equipo: 'Tigres' };

// 2. Definimos un tipo para saber quién está activo
type ActivePitcher = 'local' | 'visitante';

export default function ActivePitcherToggle() {
  
  // 3. Estado para guardar quién está activo (empieza 'local')
  const [active, setActive] = useState<ActivePitcher>('local');

  return (
    // Tarjeta contenedora (reemplaza la <section> que teníamos)
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h3 className="text-gray-500 font-semibold mb-3 text-sm">
        Pitcher Activo
      </h3>
      
      {/* 4. El Toggle (El botón largo) */}
      <div className="relative flex w-full bg-gray-200 rounded-full p-1">
        
        {/* 5. El "deslizador" (la parte blanca que se mueve) */}
        <div 
          className={`
            absolute top-1 bottom-1 w-1/2 bg-white rounded-full shadow-md 
            transition-transform duration-300 ease-in-out
            ${/* Lógica de movimiento: */ ''}
            ${active === 'local' ? 'transform translate-x-0' : 'transform translate-x-full'}
          `}
        />
        
        {/* 6. Botón Local (Izquierda) */}
        <button
          onClick={() => setActive('local')}
          // 'z-10' lo pone por ENCIMA del deslizador
          className="relative z-10 w-1/2 py-2 text-center rounded-full text-sm font-semibold transition-colors"
          // Color de texto dinámico
          style={{ color: active === 'local' ? '#1D4ED8' : '#4B5563' }} // Azul si activo, gris si no
        >
          {fakePitcherLocal.nombre} ({fakePitcherLocal.equipo})
        </button>
        
        {/* 7. Botón Visitante (Derecha) */}
        <button
          onClick={() => setActive('visitante')}
          className="relative z-10 w-1/2 py-2 text-center rounded-full text-sm font-semibold transition-colors"
          // Color de texto dinámico
          style={{ color: active === 'visitante' ? '#1D4ED8' : '#4B5563' }} // Azul si activo, gris si no
        >
          {fakePitcherVisitante.nombre} ({fakePitcherVisitante.equipo})
        </button>
        
      </div>
      
      {/* 8. Botón de Relevo (Punto 2 de tu idea) */}
      <div className="text-right mt-2">
        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
          Cambiar Pitcher (Relevo)
        </button>
      </div>
    </div>
  );
}