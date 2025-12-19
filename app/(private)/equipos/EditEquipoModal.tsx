// app/(private)/equipos/EditEquipoModal.tsx
"use client";

import type { Equipo } from "@/types/equipo";
import EquipoForm from "./EquipoForm";
import Modal from '@/app/components/Modal';

// 1. Interfaz de Props corregida
// - Añadimos 'open' que es la propiedad que realmente se usa para abrir/cerrar.
// - Simplificamos 'onSave' para que reciba el objeto Equipo completo.
interface EditEquipoModalProps {
  open: boolean;
  equipo: Equipo | null;
  onClose: () => void;
  onSave: (values: Equipo) => Promise<void> | void;
}

export default function EditEquipoModal({
  open,
  equipo,
  onClose,
  onSave,
}: EditEquipoModalProps) {
  // Si el modal no está abierto o no hay un equipo para editar, no mostramos nada.
  if (!open || !equipo) return null;

  return (
    <Modal open={open} onClose={onClose} title={`Editar Equipo`} size="md">
      <div className="p-2 sm:p-4">
        <EquipoForm
          initial={equipo}
          onCancel={onClose}
          // El formulario nos devuelve solo los campos que se pueden editar (nombre, ciudad)
          onSubmit={async (values) => {
            // 3. Construimos el objeto completo que espera la función onSave.
            // Tomamos los nuevos valores del formulario y le añadimos el 'id' del equipo original.
            await onSave({
              ...equipo, // Empezamos con los datos originales del equipo
              ...values, // Sobrescribimos con los nuevos valores del formulario
            });
          }}
        />
      </div>
    </Modal>
  );
}