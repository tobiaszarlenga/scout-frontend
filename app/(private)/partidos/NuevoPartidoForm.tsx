// En /app/(private)/partidos/NuevoPartidoForm.tsx
'use client';

import React, { useState } from 'react';
import type { Equipo } from '@/types/equipo';
import type { Pitcher } from '@/types/pitcher';

// Definimos los datos que este formulario debe manejar
export type PartidoFormData = {
  equipoLocalId: string;
  pitcherLocalId: string;
  equipoVisitanteId: string;
  pitcherVisitanteId: string;
  fecha: string;
  horario: string;
  campo: string;
};

interface Props {
  // Le pasamos los equipos y pitchers para los <select>
  equipos: Equipo[];
  pitchers: Pitcher[];
  // Funciones que el padre nos da
  onSubmit: (values: PartidoFormData) => Promise<void> | void; // Igual que en EquipoForm
  onCancel: () => void;
}

export default function NuevoPartidoForm({
  equipos,
  pitchers,
  onSubmit,
  onCancel,
}: Props) {
  
  // Estado inicial del formulario
  const [formData, setFormData] = useState<PartidoFormData>({
    equipoLocalId: '',
    pitcherLocalId: '',
    equipoVisitanteId: '',
    pitcherVisitanteId: '',
    fecha: '',
    horario: '',
    campo: '',
  });

  // --- Lógica interna del formulario (igual que EquipoForm) ---
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // ---------------------------------------------------------

  // Manejador genérico para todos los inputs/selects
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  
  // handleSubmit (igual que EquipoForm)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Aquí podrías añadir validaciones, por ejemplo:
    if (!formData.equipoLocalId || !formData.pitcherLocalId /* ...etc */) {
      setError('Por favor, completa todos los campos obligatorios.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      // Pasamos los datos al componente padre (NewPartidoModal)
      await onSubmit(formData);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocurrió un error.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtramos pitchers basados en el equipo seleccionado
  const pitchersLocales = pitchers.filter(
    (p) => p.equipoId === +formData.equipoLocalId
  );
  const pitchersVisitantes = pitchers.filter(
    (p) => p.equipoId === +formData.equipoVisitanteId
  );

  return (
    // Aplicamos 'space-y-4' como en EquipoForm
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      
      {/* --- FILA 1: EQUIPOS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Equipo Local *</label>
          <select
            name="equipoLocalId"
            value={formData.equipoLocalId}
            onChange={handleChange}
            // --- ESTILOS DE TU EquipoForm ---
            className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
            required
            disabled={submitting}
          >
            <option value="">Seleccionar equipo...</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.nombre}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium">Equipo Visitante *</label>
          <select
            name="equipoVisitanteId"
            value={formData.equipoVisitanteId}
            onChange={handleChange}
            // --- ESTILOS DE TU EquipoForm ---
            className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
            required
            disabled={submitting}
          >
            <option value="">Seleccionar equipo...</option>
            {equipos.map((eq) => (
              <option key={eq.id} value={eq.id}>{eq.nombre}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* --- FILA 2: PITCHERS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Pitcher Local *</label>
          <select
            name="pitcherLocalId"
            value={formData.pitcherLocalId}
            onChange={handleChange}
            // --- ESTILOS DE TU EquipoForm ---
            className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
            required
            disabled={!formData.equipoLocalId || submitting} // Deshabilitado hasta elegir equipo
          >
            <option value="">Seleccionar pitcher...</option>
            {pitchersLocales.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium">Pitcher Visitante *</label>
          <select
            name="pitcherVisitanteId"
            value={formData.pitcherVisitanteId}
            onChange={handleChange}
            // --- ESTILOS DE TU EquipoForm ---
            className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
            required
            disabled={!formData.equipoVisitanteId || submitting} // Deshabilitado hasta elegir equipo
          >
            <option value="">Seleccionar pitcher...</option>
            {pitchersVisitantes.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} {p.apellido}</option>
            ))}
          </select>
        </div>
      </div>

      {/* --- FILA 3: FECHA, HORA, CAMPO --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium">Fecha *</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            // --- ESTILOS DE TU EquipoForm ---
            className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Horario *</label>
          <input
            type="time"
            name="horario"
            value={formData.horario}
            onChange={handleChange}
            // --- ESTILOS DE TU EquipoForm ---
            className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
            required
            disabled={submitting}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Campo</label>
          <input
            type="text"
            name="campo"
            value={formData.campo}
            onChange={handleChange}
            placeholder="Opcional"
            // --- ESTILOS DE TU EquipoForm ---
            className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
            disabled={submitting}
          />
        </div>
      </div>

      {/* --- Mensaje de Error (igual que EquipoForm) --- */}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {/* --- Botones (igual que EquipoForm) --- */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? "Creando..." : "Crear Partido"}
        </button>
      </div>
    </form>
  );
}