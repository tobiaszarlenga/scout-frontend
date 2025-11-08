// scout-frontend/app/(private)/partidos/NewPartidoModal.tsx
'use client';

import { useState } from 'react';
import Modal from '@/app/components/Modal';
import NuevoPartidoForm from './NuevoPartidoForm';
import type { PartidoFormData } from './NuevoPartidoForm';
import { useEquipos } from 'hooks/useEquipos';
import { usePitchers } from 'hooks/usePitchers';
// --- ¡CAMBIO 1: Importamos nuestro nuevo hook! ---
import { usePartidos } from 'hooks/usePartidos'; 
import { toast } from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/solid';
import Button from '@/app/components/Button';

export default function NewPartidoModal() {
  const [open, setOpen] = useState(false);

  // --- Lógica para cargar datos (esto ya estaba perfecto) ---
  const { list: equipos } = useEquipos();
  const { list: pitchers } = usePitchers();
  
  // --- ¡CAMBIO 2: Activamos el hook de partidos! ---
  const { create } = usePartidos();

  // --- ¡CAMBIO 3: Conectamos el handleSubmit a la API! ---
  const handleSubmit = async (values: PartidoFormData) => {
    // 'values.fecha' viene del input como "YYYY-MM-DD"
    // Nuestro backend (controlador) espera "DD/MM/YYYY"
    
    // 1. Transformamos la fecha
    const [year, month, day] = values.fecha.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;

    // 2. Preparamos los datos para enviar (tipo CreatePartidoInput)
    const dataParaApi = {
      ...values, // horario y campo ya están bien
      
      // Usamos la fecha formateada
      fecha: fechaFormateada,
      
      // Convertimos los IDs de string a number
      equipoLocalId: +values.equipoLocalId,
      equipoVisitanteId: +values.equipoVisitanteId,
      pitcherLocalId: +values.pitcherLocalId,
      pitcherVisitanteId: +values.pitcherVisitanteId,
    };

    // 3. ¡Usamos la lógica de toast.promise que tenías!
    // Esto llamará a la mutación. Si falla, lanzará un error
    // que será atrapado por el 'try/catch' de NuevoPartidoForm.tsx
    // y se mostrará el error dentro del formulario. ¡Perfecto!
    await toast.promise(
      create.mutateAsync(dataParaApi),
      {
        loading: 'Guardando partido...',
        success: 'Partido creado con éxito!',
        // Mostramos el mensaje de error que viene de la API
        error: (err: Error) => err?.message || 'No se pudo crear el partido.',
      }
    );
    
    // 4. Si todo salió bien, cerramos el modal
    setOpen(false);
  };

  return (
    <>
      {/* 1. El Botón (sin cambios) */}
      <Button onClick={() => setOpen(true)} variant="secondary" className="flex items-center gap-2 rounded-full">
        <PlusIcon className="h-5 w-5 text-accent" />
        <span className="text-accent font-bold">Nuevo Partido</span>
      </Button>

      {/* 2. El Modal Genérico (sin cambios) */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-4 sm:p-6 w-full max-w-2xl">
          <h2 className="text-lg font-semibold">Nuevo Partido</h2>
          
          {/* 3. El Formulario Dedicado (sin cambios) */}
          {/* El formulario no sabe nada de la API, solo pasa los datos */}
          <NuevoPartidoForm
            equipos={equipos.data ?? []}
            pitchers={pitchers.data ?? []}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
            // Le pasamos el estado de carga de los selects
            isLoadingOptions={equipos.isPending || pitchers.isPending}
          />
        </div>
      </Modal>
    </>
  );
}