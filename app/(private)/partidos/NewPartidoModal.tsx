// scout-frontend/app/(private)/partidos/NewPartidoModal.tsx
'use client';

import { useState } from 'react';
import Modal from '@/app/components/Modal';
import NuevoPartidoForm from './NuevoPartidoForm';
import type { PartidoFormData } from './NuevoPartidoForm';
import { useEquipos } from 'hooks/useEquipos';
import { usePitchers } from 'hooks/usePitchers';
import { usePartidos } from 'hooks/usePartidos';
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/solid';
import Button from '@/app/components/Button';

export default function NewPartidoModal() {
  const [open, setOpen] = useState(false);

  const { list: equipos } = useEquipos();
  const { list: pitchers } = usePitchers();
  const { create } = usePartidos();

  const handleSubmit = async (values: PartidoFormData) => {
    const [year, month, day] = values.fecha.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;

    const dataParaApi = {
      ...values,
      fecha: fechaFormateada,
      equipoLocalId: +values.equipoLocalId,
      equipoVisitanteId: +values.equipoVisitanteId,
      pitcherLocalId: +values.pitcherLocalId,
      pitcherVisitanteId: +values.pitcherVisitanteId,
    };

    await toast.promise(create.mutateAsync(dataParaApi), {
      loading: 'Guardando partido...',
      success: 'Partido creado con éxito!',
      error: (err: Error) => err?.message || 'No se pudo crear el partido.',
    });

    setOpen(false);
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="secondary"
        className="flex items-center gap-2 rounded-full"
      >
        <PlusIcon className="h-5 w-5 text-accent" />
        <span className="text-accent font-bold">Nuevo Partido</span>
      </Button>

      <Modal open={open} onClose={() => setOpen(false)}>
        {/* id para scopear estilos sin tocar globals.css */}
        <div
          id="nuevo-partido-modal"
          className="w-full max-w-2xl p-4 sm:p-6 rounded-lg border
                     bg-[var(--color-card)] text-[var(--color-text)] border-[var(--color-border)]"
        >
          <h2 className="text-lg font-semibold mb-4">Nuevo Partido</h2>

          <NuevoPartidoForm
            equipos={equipos.data ?? []}
            pitchers={pitchers.data ?? []}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            isLoadingOptions={equipos.isPending || pitchers.isPending}
          />
        </div>

        {/* Usa SOLO variables de globals.css; pinta inputs, selects y el dropdown */}
        <style>{`
          #nuevo-partido-modal label {
            color: var(--color-muted);
            font-weight: 600;
          }

          #nuevo-partido-modal input,
          #nuevo-partido-modal select,
          #nuevo-partido-modal textarea {
            background: rgba(255,255,255,0.06);
            color: var(--color-text);
            border: 1px solid var(--color-border);
            border-radius: 10px;
            cursor: pointer;
          }

          #nuevo-partido-modal input::placeholder,
          #nuevo-partido-modal textarea::placeholder {
            color: var(--color-muted);
          }

          #nuevo-partido-modal input:focus,
          #nuevo-partido-modal select:focus,
          #nuevo-partido-modal textarea:focus {
            outline: none;
            border-color: rgba(var(--color-accent-rgb), 0.7);
            box-shadow: 0 0 0 3px rgba(var(--color-accent-rgb), 0.25);
          }

          #nuevo-partido-modal input:disabled,
          #nuevo-partido-modal select:disabled,
          #nuevo-partido-modal textarea:disabled {
            background: rgba(255,255,255,0.02);
            color: var(--color-muted);
            cursor: not-allowed;
          }

          /* ⬇️ Dropdown del <select> en oscuro, usando tus tokens */
          #nuevo-partido-modal select option {
            background: var(--color-card);
            color: var(--color-text);
          }
        `}</style>
      </Modal>
    </>
  );
}
