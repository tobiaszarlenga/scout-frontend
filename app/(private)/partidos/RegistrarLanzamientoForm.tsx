// En: app/(private)/partidos/RegistrarLanzamientoForm.tsx
'use client';

import React, { useState } from 'react';

// --- 1. Definimos los tipos de datos que este formulario manejará ---
export interface LanzamientoData {
  velocidad: number | null;
  tipoEfecto: string;
  resultado: string;
}

interface RegistrarLanzamientoFormProps {
  // Función para llamar cuando el usuario guarda (le pasamos los datos)
  onSubmit: (data: LanzamientoData) => void;
  // Función para llamar cuando el usuario cancela
  onCancel: () => void;
}

// --- 2. Datos de ejemplo para los <select> ---
// (Más adelante, esto podría venir de tu base de datos)
const tiposDeEfecto = [
  'Recta (4 costuras)',
  'Recta (2 costuras)',
  'Curva',
  'Slider',
  'Cambio (Circle)',
];

// (Basado en tu maqueta image_f039d5.png)
const resultadosDeLanzamiento = [
  'Strike',
  'Bola',
  'Hit',
  'Out',
  'Foul',
];

export default function RegistrarLanzamientoForm({
  onSubmit,
  onCancel,
}: RegistrarLanzamientoFormProps) {
  
  // --- 3. Estados internos para guardar los valores del formulario ---
  const [velocidad, setVelocidad] = useState<number | null>(null);
  const [tipoEfecto, setTipoEfecto] = useState('');
  const [resultado, setResultado] = useState('');

  // --- 4. Manejador del botón "Guardar" ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Evita que la página se recargue

    // TODO: Agregar validación (ej. que los campos no estén vacíos)
    
    // Llamamos a la función 'onSubmit' que nos pasó el padre
    // y le entregamos los datos del estado.
    onSubmit({
      velocidad,
      tipoEfecto,
      resultado,
    });
  };

  return (
    // Usamos <form> para que funcione el 'onSubmit'
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-4">
        
        {/* --- Campo Velocidad --- */}
        <div>
          <label
            htmlFor="velocidad"
            className="block text-sm font-medium text-gray-700"
          >
            Velocidad (mph)
          </label>
          <input
            type="number"
            id="velocidad"
            value={velocidad ?? ''} // '??' para manejar el 'null'
            onChange={(e) => setVelocidad(e.target.valueAsNumber || null)}
            placeholder="Ej: 65"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* --- Campo Tipo de Efecto --- */}
        <div>
          <label
            htmlFor="tipoEfecto"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo de Efecto
          </label>
          <select
            id="tipoEfecto"
            value={tipoEfecto}
            onChange={(e) => setTipoEfecto(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Seleccionar efecto</option>
            {tiposDeEfecto.map((tipo) => (
              <option key={tipo} value={tipo}>{tipo}</option>
            ))}
          </select>
        </div>

        {/* --- Campo Resultado --- */}
        <div>
          <label
            htmlFor="resultado"
            className="block text-sm font-medium text-gray-700"
          >
            Resultado
          </label>
          <select
            id="resultado"
            value={resultado}
            onChange={(e) => setResultado(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Seleccionar resultado</option>
            {resultadosDeLanzamiento.map((res) => (
              <option key={res} value={res}>{res}</option>
            ))}
          </select>
        </div>

        {/* --- Botones de Acción --- */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button" // 'type="button"' para que no envíe el formulario
            onClick={onCancel} // Llama a la función 'onCancel' del padre
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit" // 'type="submit"' para que llame a 'handleSubmit'
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}