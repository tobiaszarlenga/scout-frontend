// scout-frontend/app/(private)/partidos/NuevoPartidoForm.tsx
'use client';

import React, { useState } from 'react';
import Button from '@/app/components/Button';
import CustomSelect from '@/app/components/CustomSelect';
import type { Equipo } from '@/types/equipo';
import type { Pitcher } from '@/types/pitcher';

// ... (tipo PartidoFormData sin cambios) ...
export type PartidoFormData = {
  equipoLocalId: string;
  pitcherLocalId: string;
  equipoVisitanteId: string;
  pitcherVisitanteId: string;
  fecha: string;
  horario: string;
  campo: string;
};

// ... (interface Props sin cambios) ...
interface Props {
  equipos: Equipo[];
  pitchers: Pitcher[];
  onSubmit: (values: PartidoFormData) => Promise<void> | void;
  onCancel: () => void;
  isLoadingOptions?: boolean;
}

export default function NuevoPartidoForm({
  equipos,
  pitchers,
  onSubmit,
  onCancel,
  isLoadingOptions,
}: Props) {
  
  // ... (estado formData sin cambios) ...
  const [formData, setFormData] = useState<PartidoFormData>({
    equipoLocalId: '',
    pitcherLocalId: '',
    equipoVisitanteId: '',
    pitcherVisitanteId: '',
    fecha: '',
    horario: '',
    campo: '',
  });

  // ... (estados error y submitting sin cambios) ...
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (
    name: keyof PartidoFormData,
    value: string
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'equipoLocalId' && value !== prev.equipoLocalId) {
        next.pitcherLocalId = '';
      }
      if (name === 'equipoVisitanteId' && value !== prev.equipoVisitanteId) {
        next.pitcherVisitanteId = '';
      }
      return next;
    });
  };
  
  // --- ¡CAMBIO AQUÍ! ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reseteamos el error en cada envío
    setError(null);

    // ¡Validación completa!
    // Revisamos todos los campos requeridos. 'campo' es opcional.
    if (
      !formData.equipoLocalId ||
      !formData.equipoVisitanteId ||
      !formData.pitcherLocalId ||
      !formData.pitcherVisitanteId ||
      !formData.fecha ||
      !formData.horario
    ) {
      setError('Por favor, completa todos los campos obligatorios.');
      return; // Detiene la ejecución si falta algo
    }

    // --- FIN DEL CAMBIO ---

    try {
      setSubmitting(true);
      // ¡El error se borró arriba!
      // setError(null); 
      
      // Pasamos los datos al componente padre (NewPartidoModal)
      await onSubmit(formData);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocurrió un error.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ... (lógica de pitchersLocales y pitchersVisitantes sin cambios) ...
  const pitchersLocales = pitchers.filter(
    (p) => p.equipoId === +formData.equipoLocalId
  );
  const pitchersVisitantes = pitchers.filter(
    (p) => p.equipoId === +formData.equipoVisitanteId
  );

  return (
    // ... (Todo el JSX del formulario <form>... es idéntico y está perfecto) ...
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      
      {/* --- FILA 1: EQUIPOS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Equipo Local *</label>
          <CustomSelect
            value={formData.equipoLocalId}
            onChange={(val) => handleChange('equipoLocalId', String(val))}
            options={equipos.map((eq) => ({ id: eq.id, nombre: eq.nombre }))}
            placeholder={isLoadingOptions ? 'Cargando...' : 'Seleccionar equipo...'}
            disabled={submitting || isLoadingOptions}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Equipo Visitante *</label>
          <CustomSelect
            value={formData.equipoVisitanteId}
            onChange={(val) => handleChange('equipoVisitanteId', String(val))}
            options={equipos.map((eq) => ({ id: eq.id, nombre: eq.nombre }))}
            placeholder={isLoadingOptions ? 'Cargando...' : 'Seleccionar equipo...'}
            disabled={submitting || isLoadingOptions}
          />
        </div>
      </div>
      
      {/* --- FILA 2: PITCHERS --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Pitcher Local *</label>
          <CustomSelect
            value={formData.pitcherLocalId}
            onChange={(val) => handleChange('pitcherLocalId', String(val))}
            options={pitchersLocales.map((p) => ({ id: p.id, nombre: `${p.nombre} ${p.apellido}` }))}
            placeholder={formData.equipoLocalId ? 'Seleccionar pitcher...' : 'Selecciona equipo primero'}
            disabled={!formData.equipoLocalId || submitting || isLoadingOptions}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium">Pitcher Visitante *</label>
          <CustomSelect
            value={formData.pitcherVisitanteId}
            onChange={(val) => handleChange('pitcherVisitanteId', String(val))}
            options={pitchersVisitantes.map((p) => ({ id: p.id, nombre: `${p.nombre} ${p.apellido}` }))}
            placeholder={formData.equipoVisitanteId ? 'Seleccionar pitcher...' : 'Selecciona equipo primero'}
            disabled={!formData.equipoVisitanteId || submitting || isLoadingOptions}
          />
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
            onChange={(e) => handleChange('fecha', e.target.value)}
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
            onChange={(e) => handleChange('horario', e.target.value)}
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
            onChange={(e) => handleChange('campo', e.target.value)}
            placeholder="Opcional"
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
          disabled={submitting}
          className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
        >
          Cancelar
        </button>
        <Button type="submit" variant="primary"  disabled={submitting}>
          {submitting ? 'Creando...' : 'Crear Partido'}
        </Button>
      </div>
    </form>
  );
}