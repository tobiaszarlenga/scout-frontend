// En: app/(private)/partidos/ScoutCounterCard.tsx
'use client';

import React, { useState, useEffect } from 'react';

// Props: Definimos qué "parámetros" necesita este componente
interface ScoutCounterCardProps {
  title: string;
  initialValue?: number;
  // Opcional: Para mostrar texto extra, como "Lanzando: Tigres"
  footerText?: string; 
  // Opcional: Valor controlado desde el padre
  value?: number;
  // Opcional: Valor máximo permitido
  maxValue?: number;
}

/**
 * Una tarjeta reutilizable con botones de incremento/decremento
 * para el marcador (Innings y Outs).
 */
export default function ScoutCounterCard({ 
  title, 
  initialValue = 0, 
  footerText,
  value,
  maxValue
}: ScoutCounterCardProps) {
  
  // --- 1. Estado ---
  // Usamos 'useState' para guardar el valor actual del contador
  const [count, setCount] = useState(initialValue);
  
  // Si se pasa un valor controlado, actualizar el estado interno
  useEffect(() => {
    if (value !== undefined) {
      setCount(value);
    }
  }, [value]);

  // --- 2. Manejadores de Clic ---
  const increment = () => {
    // Si hay un maxValue definido, no permitir superar ese valor
    if (maxValue !== undefined && count >= maxValue) {
      return; // No hacer nada si ya está en el máximo
    }
    setCount(prevCount => prevCount + 1);
  };

  const decrement = () => {
    // No permitimos valores negativos
    setCount(prevCount => Math.max(0, prevCount - 1)); 
  };

  // --- 3. Renderizado ---
  return (
    // Tarjeta principal (igual a los divs que teníamos)
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      
      {/* Título */}
      <h3 className="text-center text-gray-500 font-semibold mb-2">
        {title}
      </h3>
      
      {/* Cuerpo principal con botones y número */}
      <div className="flex items-center justify-center space-x-4">
        {/* Botón de Restar */}
        <button 
          onClick={decrement}
          disabled={count === 0}
          className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-600 hover:bg-gray-200 ${
            count === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={`Disminuir ${title}`}
        >
          -
        </button>

        {/* Número */}
        <span className="text-6xl font-bold text-gray-800 w-20 text-center">
          {count}
        </span>

        {/* Botón de Sumar */}
        <button 
          onClick={increment}
          disabled={maxValue !== undefined && count >= maxValue}
          className={`w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-2xl text-gray-600 hover:bg-gray-200 ${
            maxValue !== undefined && count >= maxValue ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          aria-label={`Aumentar ${title}`}
        >
          +
        </button>
      </div>

      {/* Texto de pie de página (opcional) */}
      {footerText && (
        <p className="text-center text-sm text-gray-500 mt-2">
          {footerText}
        </p>
      )}
    </div>
  );
}