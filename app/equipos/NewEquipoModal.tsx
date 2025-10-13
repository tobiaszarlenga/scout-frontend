"use client";

import { useState } from "react";
import Modal from "../components/Modal"; // 👈 Corregido para usar el alias
import EquipoForm from "./EquipoForm";
import { useEquipos } from '@/hooks/useEquipos';
import type { Equipo } from "@/types/equipo"; // 👈 Corregido para usar el alias

// Definimos el tipo para los datos del formulario, excluyendo el 'id'
type CreateEquipoInput = Omit<Equipo, 'id'>;

export default function NewEquipoModal() {
  const { create } = useEquipos();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        className="rounded-md bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        Nuevo equipo
      </button>

      <Modal open={open} onClose={() => setOpen(false)}>
        <div className="p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Nuevo equipo</h2>
          <EquipoForm
            onSubmit={async (values: CreateEquipoInput) => {
              // --- INICIO DE LA CORRECCIÓN ---
              const dataToSubmit = {
                nombre: values.nombre,
                ciudad: values.ciudad || null, // Asegura que 'ciudad' sea string o null
              };
              await create.mutateAsync(dataToSubmit);
              // --- FIN DE LA CORRECCIÓN ---
              
              alert(`Equipo "${values.nombre}" creado correctamente`);
              setOpen(false);
            }}
            onCancel={() => setOpen(false)}
          />
        </div>
      </Modal>
    </>
  );
}