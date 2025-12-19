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
  // Opcional: Callback cuando cambia el valor
  onChange?: (newValue: number) => void;
  // Opcional: Deshabilitar botones (solo lectura)
  readOnly?: boolean;
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
  maxValue,
  onChange,
  readOnly = false
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
    const newValue = count + 1;
    setCount(newValue);
    // Notificar al padre si hay callback
    if (onChange) {
      onChange(newValue);
    }
  };

  const decrement = () => {
    // No permitimos valores negativos
    const newValue = Math.max(0, count - 1);
    setCount(newValue);
    // Notificar al padre si hay callback
    if (onChange) {
      onChange(newValue);
    }
  };

  // --- 3. Renderizado ---
  return (
    // Tarjeta principal (igual a los divs que teníamos)
    <div className="p-4 rounded-lg shadow-md" style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}>
      {/* Título */}
      <h3 className="text-center font-semibold mb-2" style={{ color: 'var(--color-muted)' }}>
        {title}
      </h3>
      
      {/* Cuerpo principal con botones y número */}
      <div className="flex items-center justify-center space-x-4">
        {/* Botón de Restar */}
        {!readOnly && (
          <button
            onClick={decrement}
            disabled={count === 0}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${
              count === 0 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: 'rgba(var(--color-text-rgb),0.06)', color: 'var(--color-text)' }}
            aria-label={`Disminuir ${title}`}
          >
            -
          </button>
        )}

        {/* Número */}
        <span className={`text-6xl font-bold text-center ${readOnly ? 'w-full' : 'w-20'}`} style={{ color: 'var(--color-text)' }}>
          {count}
        </span>

        {/* Botón de Sumar */}
        {!readOnly && (
          <button
            onClick={increment}
            disabled={maxValue !== undefined && count >= maxValue}
            className={`w-10 h-10 rounded-full flex items-center justify-center text-2xl ${
              maxValue !== undefined && count >= maxValue ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            style={{ backgroundColor: 'rgba(var(--color-text-rgb),0.06)', color: 'var(--color-text)' }}
            aria-label={`Aumentar ${title}`}
          >
            +
          </button>
        )}
      </div>

      {/* Texto de pie de página (opcional) */}
      {footerText && (
        <p className="text-center text-sm mt-2" style={{ color: 'var(--color-muted)' }}>
          {footerText}
        </p>
      )}
    </div>
  );
}