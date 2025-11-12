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
          <label htmlFor="pitcherSelect" className="block text-sm font-medium text-gray-700 mb-2">
            Seleccionar pitcher del equipo
          </label>
          <select
            id="pitcherSelect"
            value={pitcherIdSeleccionado}
            onChange={(e) => setPitcherIdSeleccionado(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            autoFocus
          >
            <option value="">Seleccionar pitcher...</option>
            {pitchersDisponibles.map((pitcher) => (
              <option key={pitcher.id} value={pitcher.id}>
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
          <Button type="submit" variant="primary" className="bg-blue-600 hover:bg-blue-700" disabled={!pitcherIdSeleccionado}>
            Confirmar Cambio
          </Button>
        </div>
      </form>
    </Modal>
  );
}
