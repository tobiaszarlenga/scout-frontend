// En: app/(private)/partidos/CambiarPitcherModal.tsx
"use client";

import React, { useState } from 'react';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Button';

// Tipo para los pitchers disponibles
interface PitcherOption {
  id: number;
  nombre: string;
  apellido: string;
  numero_camiseta: number;
}

interface CambiarPitcherModalProps {
  open: boolean;
  onClose: () => void;
  tipo: 'local' | 'visitante';
  equipoNombre: string;
  pitchersDisponibles: PitcherOption[]; // Lista de pitchers del equipo
  onCambiar: (pitcherId: number, nombreCompleto: string) => void; // Ahora recibe el ID
}

export default function CambiarPitcherModal({
  open,
  onClose,
  tipo,
  equipoNombre,
  pitchersDisponibles,
  onCambiar
}: CambiarPitcherModalProps) {
  
  const [pitcherIdSeleccionado, setPitcherIdSeleccionado] = useState<string>('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pitcherIdSeleccionado) {
      const pitcher = pitchersDisponibles.find(p => p.id === Number(pitcherIdSeleccionado));
      if (pitcher) {
        const nombreCompleto = `${pitcher.nombre} ${pitcher.apellido}`;
        onCambiar(pitcher.id, nombreCompleto);
        setPitcherIdSeleccionado('');
        onClose();
      }
    }
  };
  
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Cambiar Pitcher ${tipo === 'local' ? 'Local' : 'Visitante'} (${equipoNombre})`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="pitcherSelect" className="block text-sm font-medium mb-2" style={{ color: 'var(--color-text)' }}>
            Seleccionar pitcher del equipo
          </label>
          <select
            id="pitcherSelect"
            value={pitcherIdSeleccionado}
            onChange={(e) => setPitcherIdSeleccionado(e.target.value)}
            className="w-full px-3 py-2 rounded-md shadow-sm focus:outline-none"
            style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
            autoFocus
          >
            <option value="" style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}>Seleccionar pitcher...</option>
            {pitchersDisponibles.map((pitcher) => (
              <option key={pitcher.id} value={pitcher.id} style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}>
                {pitcher.nombre} {pitcher.apellido} - #{pitcher.numero_camiseta}
              </option>
            ))}
          </select>
        </div>
        
        {pitchersDisponibles.length === 0 && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">
              <strong>Atención:</strong> No hay pitchers disponibles para este equipo.
            </p>
          </div>
        )}
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
          <p className="text-sm text-yellow-800">
            <strong>Nota:</strong> El pitcher actual dejará de lanzar y el nuevo pitcher entrará en relevo.
          </p>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={!pitcherIdSeleccionado}>
            Confirmar Cambio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
