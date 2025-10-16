"use client";

import { useState } from "react";
import Modal from "@/app/components/Modal"; // ajustá la ruta si es otra
import EquipoForm from "./EquipoForm";
import { useEquipos } from "hooks/useEquipos";
import type { CreateEquipoInput } from "types/equipo"; // 👈 usa el alias común

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
              await create.mutateAsync(values);              
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
