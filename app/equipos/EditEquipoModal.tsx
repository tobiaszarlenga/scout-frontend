"use client";

import Modal from "../components/Modal";
import EquipoForm from "./EquipoForm";
// import { useEquipos } from "@/hooks/useEquipos"; // 1. Eliminamos esta línea, no se usa

// 2. Definimos el tipo para el objeto 'equipo'
//    (Asegúrate de que la ruta de importación sea la correcta para tu proyecto)
import type { Equipo } from "../../types/equipo"; 

// 3. Definimos la "forma" que deben tener las props del componente
interface EditEquipoModalProps {
  open: boolean;
  equipo: Equipo | null; // Puede ser un Equipo o null cuando está cerrado
  onClose: () => void; // Una función que no devuelve nada
  onSave: (values: Equipo) => Promise<void>; // Una función que recibe los valores y es asíncrona
}

// 4. Aplicamos los tipos a las props
export default function EditEquipoModal({ equipo, open, onClose, onSave }: EditEquipoModalProps) {
  if (!open || !equipo) return null;

  return (
    <Modal open={open} onClose={onClose}>
      <div className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold">Editar equipo</h2>
        <EquipoForm
          initial={equipo}
          onSubmit={async (values) => {
            // Pasamos el ID junto con los nuevos valores
            await onSave({ ...values, id: equipo.id }); 
          }}
          onCancel={onClose}
        />
      </div>
    </Modal>
  );
}