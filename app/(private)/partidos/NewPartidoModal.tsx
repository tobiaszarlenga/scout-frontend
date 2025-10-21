// En /app/(private)/partidos/NewPartidoModal.tsx
// (Este es tu archivo 'NuevoPartidoModal.tsx' renombrado y actualizado)
'use client';

import { useState } from 'react';
import Modal from '@/app/components/Modal'; // <-- Usamos tu Modal genérico
import NuevoPartidoForm from './NuevoPartidoForm'; // <-- Usamos el Form que creamos
import type { PartidoFormData } from './NuevoPartidoForm'; // <-- El tipo de datos del form
import { useEquipos } from 'hooks/useEquipos'; // <-- Usamos tu hook
import { usePitchers } from 'hooks/usePitchers'; // <-- Usamos tu hook
import { toast } from 'react-hot-toast'; // <-- Usamos toast
import { PlusIcon } from '@heroicons/react/24/solid'; // <-- Usamos el ícono

export default function NewPartidoModal() {
  const [open, setOpen] = useState(false);

  // --- Lógica para cargar datos ---
  // Traemos los datos para los menús desplegables
  const { list: equipos } = useEquipos();
  const { list: pitchers } = usePitchers();
  
  // --- Hook para 'partidos' (aún no lo tenemos, lo simulamos) ---
  // const { create } = usePartidos(); // <-- Esto lo haremos en el futuro

  const handleSubmit = async (values: PartidoFormData) => {
    // --- Lógica de 'toast' (simulada por ahora) ---
    console.log('Datos a enviar:', values);
    
    // ESTO ES LO QUE HAREMOS CUANDO TENGAMOS EL API Y EL HOOK 'usePartidos'
    /*
    await toast.promise(
      create.mutateAsync({
        ...values,
        // Convertimos los IDs a números
        equipoLocalId: +values.equipoLocalId,
        pitcherLocalId: +values.pitcherLocalId,
        equipoVisitanteId: +values.equipoVisitanteId,
        pitcherVisitanteId: +values.pitcherVisitanteId,
        fecha: new Date(values.fecha), // Convertimos string a Date
      }),
      {
        loading: 'Guardando partido...',
        success: `Partido creado con éxito!`,
        error: 'No se pudo crear el partido.',
      }
    );
    */
    
    // Por ahora, solo mostramos un toast simple y cerramos
    toast.success('Partido creado (simulación)');
    setOpen(false);
  };

  return (
    <>
      {/* 1. El Botón (con los estilos de tu NewEquipoModal) */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-white px-5 py-2 font-bold text-[#012F8A] shadow-lg transition-transform duration-300 hover:-translate-y-1 hover:bg-[#90aff2] hover:text-white hover:shadow-2xl"
      >
        <PlusIcon className="h-5 w-5" />
        Nuevo Partido
      </button>

      {/* 2. El Modal Genérico */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-4 sm:p-6 w-full max-w-2xl"> {/* Lo hacemos más ancho */}
          <h2 className="text-lg font-semibold">Nuevo Partido</h2>
          
          {/* 3. El Formulario Dedicado */}
          <NuevoPartidoForm
            // Le pasamos los datos que cargamos de los hooks
            // (Usamos '?? []' para evitar errores si los datos aún no cargan)
           equipos={equipos.data ?? []}
            pitchers={pitchers.data ?? []}
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </div>
      </Modal>
    </>
  );
}