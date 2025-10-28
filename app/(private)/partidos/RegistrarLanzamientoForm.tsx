// En: app/(private)/partidos/RegistrarLanzamientoForm.tsx
'use client';

import React, { useState } from 'react';
// --- CAMBIO 1: Importamos el nuevo hook ---
// (Ajusta la ruta si tu alias '@/' es diferente)
import { useLookups } from '@/hooks/useLookups';

// --- CAMBIO 2: ¡Actualizamos la interfaz de datos! ---
// Ahora enviaremos los IDs (números) en lugar de texto.
export interface LanzamientoData {
  velocidad: number | null;
  tipoId: number | null;
  resultadoId: number | null;
}

interface RegistrarLanzamientoFormProps {
  onSubmit: (data: LanzamientoData) => void;
  onCancel: () => void;
}

// --- CAMBIO 3: ¡Borramos los arrays 'harcodeados'! ---
// (Ya no necesitamos 'tiposDeEfecto' ni 'resultadosDeLanzamiento')

export default function RegistrarLanzamientoForm({
  onSubmit,
  onCancel,
}: RegistrarLanzamientoFormProps) {
  
  // --- CAMBIO 4: Llamamos al hook para cargar los datos ---
  const { tipos, resultados } = useLookups();

  // --- CAMBIO 5: Actualizamos los estados internos ---
  // Ahora guardan 'number | null' en lugar de 'string'
  const [velocidad, setVelocidad] = useState<number | null>(null);
  const [tipoId, setTipoId] = useState<number | null>(null);
  const [resultadoId, setResultadoId] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- CAMBIO 6: Enviamos los IDs ---
    onSubmit({
      velocidad,
      tipoId,
      resultadoId,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex flex-col space-y-4">
        
        {/* --- Campo Velocidad (Sin cambios) --- */}
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
            value={velocidad ?? ''}
            onChange={(e) => setVelocidad(e.target.valueAsNumber || null)}
            placeholder="Ej: 65"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {/* --- CAMBIO 7: Campo Tipo de Efecto (Ahora dinámico) --- */}
        <div>
          <label
            htmlFor="tipoEfecto"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo de Efecto
          </label>
          <select
            id="tipoEfecto"
            value={tipoId ?? ''} // Controlado por 'tipoId'
            // Convertimos el valor (string) de vuelta a número
            onChange={(e) => setTipoId(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={tipos.isLoading || tipos.isError} // Desactivado si está cargando
          >
            <option value="">Seleccionar efecto</option>
            {/* --- Lógica de Carga --- */}
            {tipos.isLoading && <option>Cargando tipos...</option>}
            {tipos.isError && <option>Error al cargar</option>}
            {/* --- Mapeamos los datos de la API --- */}
            {tipos.data?.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>{tipo.nombre}</option>
            ))}
          </select>
        </div>

        {/* --- CAMBIO 8: Campo Resultado (Ahora dinámico) --- */}
        <div>
          <label
            htmlFor="resultado"
            className="block text-sm font-medium text-gray-700"
          >
            Resultado
          </label>
          <select
            id="resultado"
            value={resultadoId ?? ''} // Controlado por 'resultadoId'
            onChange={(e) => setResultadoId(e.target.value ? Number(e.target.value) : null)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            disabled={resultados.isLoading || resultados.isError} // Desactivado si está cargando
          >
            <option value="">Seleccionar resultado</option>
            {/* --- Lógica de Carga --- */}
            {resultados.isLoading && <option>Cargando resultados...</option>}
            {resultados.isError && <option>Error al cargar</option>}
            {/* --- Mapeamos los datos de la API --- */}
            {resultados.data?.map((res) => (
              <option key={res.id} value={res.id}>{res.nombre}</option>
            ))}
          </select>
        </div>

        {/* --- Botones de Acción (Sin cambios) --- */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="rounded-lg bg-gray-800 px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
          >
            Guardar
          </button>
        </div>
      </div>
    </form>
  );
}