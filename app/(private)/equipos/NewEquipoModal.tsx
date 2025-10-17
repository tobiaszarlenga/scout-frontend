// app/(private)/equipos/NewEquipoModal.tsx
"use client";

import { useState } from "react";
import Modal from "@/app/components/Modal";
import EquipoForm from "./EquipoForm";
import { useEquipos } from "hooks/useEquipos";
import { toast } from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/solid";

// Definimos un tipo para los datos que vienen del formulario.
// Ya no incluye 'autorId'.
type EquipoFormData = {
  nombre: string;
  ciudad: string | null;
};

export default function NewEquipoModal() {
  const { create } = useEquipos();
  const [open, setOpen] = useState(false);

  // La función handleSubmit ahora espera el tipo 'EquipoFormData'
  const handleSubmit = async (values: EquipoFormData) => {
    await toast.promise(
      // Pasamos los valores directamente a la mutación.
      // El backend se encarga de añadir el autorId.
      create.mutateAsync(values),
      {
        loading: 'Guardando equipo...',
        success: `Equipo "${values.nombre}" creado con éxito!`,
        error: 'No se pudo crear el equipo.',
      }
    );
    setOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full bg-white px-5 py-2 font-bold text-[#012F8A] shadow-lg transition-transform duration-300 hover:-translate-y-1"
      >
        <PlusIcon className="h-5 w-5" />
        Nuevo Equipo
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Nuevo Equipo</h2>
          <EquipoForm
            onSubmit={handleSubmit}
            onCancel={() => setOpen(false)}
          />
        </div>
      </Modal>
    </>
  );
}