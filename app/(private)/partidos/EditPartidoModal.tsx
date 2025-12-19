'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Button';
import CustomSelect from '@/app/components/CustomSelect';
import { usePartidos } from '@/hooks/usePartidos';
import { useEquipos } from '@/hooks/useEquipos';
import { usePitchers } from '@/hooks/usePitchers';
import type { PartidoConDetalles } from '@/types/partido';
import toast from 'react-hot-toast';

interface Props {
  open: boolean;
  onClose: () => void;
  partido: PartidoConDetalles;
}

export default function EditPartidoModal({ open, onClose, partido }: Props) {
  const { edit } = usePartidos();
  const { list: equiposList } = useEquipos();
  const { list: pitchersList } = usePitchers();

  const [form, setForm] = useState({
    equipoLocalId: partido.equipoLocalId,
    equipoVisitanteId: partido.equipoVisitanteId,
    pitcherLocalId: partido.pitcherLocalId,
    pitcherVisitanteId: partido.pitcherVisitanteId,
    fecha: new Date(partido.fecha).toISOString().split('T')[0],
    horario: new Date(partido.fecha).toISOString().split('T')[1]?.slice(0, 5) || '00:00',
    campo: partido.campo || '',
  });

  // Actualizar formulario cuando cambia el partido
  useEffect(() => {
    if (partido && open) {
      setForm({
        equipoLocalId: partido.equipoLocalId,
        equipoVisitanteId: partido.equipoVisitanteId,
        pitcherLocalId: partido.pitcherLocalId,
        pitcherVisitanteId: partido.pitcherVisitanteId,
        fecha: new Date(partido.fecha).toISOString().split('T')[0],
        horario: new Date(partido.fecha).toISOString().split('T')[1]?.slice(0, 5) || '00:00',
        campo: partido.campo || '',
      });
    }
  }, [partido, open]);

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'equipoLocalId' && value !== prev.equipoLocalId) {
        next.pitcherLocalId = '' as unknown as number;
      }
      if (field === 'equipoVisitanteId' && value !== prev.equipoVisitanteId) {
        next.pitcherVisitanteId = '' as unknown as number;
      }
      return next;
    });
  };

  const submit = async () => {
    if (!form.equipoLocalId || !form.equipoVisitanteId || !form.pitcherLocalId || !form.pitcherVisitanteId || !form.fecha) {
      toast.error('Completa todos los campos requeridos');
      return;
    }

    const dateTime = new Date(`${form.fecha}T${form.horario}:00`);

    try {
      await edit.mutateAsync({
        id: partido.id,
        data: {
          equipoLocalId: parseInt(String(form.equipoLocalId)),
          equipoVisitanteId: parseInt(String(form.equipoVisitanteId)),
          pitcherLocalId: parseInt(String(form.pitcherLocalId)),
          pitcherVisitanteId: parseInt(String(form.pitcherVisitanteId)),
          fecha: dateTime.toISOString(),
          campo: form.campo,
        },
      });
      toast.success('Partido actualizado');
      onClose();
    } catch (error) {
      console.error('Error al actualizar partido:', error);
      toast.error(error instanceof Error ? error.message : 'Error al actualizar partido');
    }
  };

  const equipos = equiposList.data ?? [];
  const pitchers = pitchersList.data ?? [];
  const pitchersLocales = pitchers.filter((p) => p.equipoId === Number(form.equipoLocalId));
  const pitchersVisitantes = pitchers.filter((p) => p.equipoId === Number(form.equipoVisitanteId));

  return (
    <Modal open={open} onClose={onClose} title="Editar Partido">
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-muted)' }}>Equipo Local</label>
            <CustomSelect
              value={form.equipoLocalId ?? ''}
              onChange={(val) => handleChange('equipoLocalId', val === '' ? '' : Number(val))}
              options={equipos.map((e) => ({ id: e.id, nombre: e.nombre }))}
              placeholder="Selecciona equipo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-muted)' }}>Equipo Visitante</label>
            <CustomSelect
              value={form.equipoVisitanteId ?? ''}
              onChange={(val) => handleChange('equipoVisitanteId', val === '' ? '' : Number(val))}
              options={equipos.map((e) => ({ id: e.id, nombre: e.nombre }))}
              placeholder="Selecciona equipo"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-muted)' }}>Pitcher Local</label>
            <CustomSelect
              value={form.pitcherLocalId ?? ''}
              onChange={(val) => handleChange('pitcherLocalId', val === '' ? '' : Number(val))}
              options={pitchersLocales.map((p) => ({ id: p.id, nombre: `${p.nombre} ${p.apellido}` }))}
              placeholder={form.equipoLocalId ? 'Selecciona pitcher' : 'Selecciona equipo primero'}
              disabled={!form.equipoLocalId}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-muted)' }}>Pitcher Visitante</label>
            <CustomSelect
              value={form.pitcherVisitanteId ?? ''}
              onChange={(val) => handleChange('pitcherVisitanteId', val === '' ? '' : Number(val))}
              options={pitchersVisitantes.map((p) => ({ id: p.id, nombre: `${p.nombre} ${p.apellido}` }))}
              placeholder={form.equipoVisitanteId ? 'Selecciona pitcher' : 'Selecciona equipo primero'}
              disabled={!form.equipoVisitanteId}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-muted)' }}>Fecha</label>
            <input
              type="date"
              value={form.fecha}
              onChange={(e) => handleChange('fecha', e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.06)] border border-[var(--color-border)] text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-muted)' }}>Horario</label>
            <input
              type="time"
              value={form.horario}
              onChange={(e) => handleChange('horario', e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.06)] border border-[var(--color-border)] text-[var(--color-text)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: 'var(--color-muted)' }}>Campo</label>
            <input
              type="text"
              value={form.campo}
              onChange={(e) => handleChange('campo', e.target.value)}
              placeholder="Ej: A, B"
              className="w-full px-3 py-2 rounded-md bg-[rgba(255,255,255,0.06)] border border-[var(--color-border)] text-[var(--color-text)]"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={edit.isPending}>
            {edit.isPending ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
