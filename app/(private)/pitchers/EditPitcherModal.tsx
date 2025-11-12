// app/(private)/pitchers/EditPitcherModal.tsx
"use client";

import { useEffect } from "react";
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Button';
import { useForm, SubmitHandler } from "react-hook-form";
import { usePitchers } from "@/hooks/usePitchers";
import { useEquipos } from "@/hooks/useEquipos";
import type { Pitcher, CreatePitcherDto } from "@/types/pitcher";
import { toast } from "react-hot-toast";

// --- CAMBIO 1: Importamos el ícono de Editar ---
import { PencilIcon } from "@heroicons/react/24/solid";

// --- CAMBIO 2: Copiamos la variable de estilos de NewPitcherModal ---
const inputStyle =
  "mt-1 block w-full rounded-md border-appborder shadow-sm " +
  "bg-[rgba(var(--color-text-rgb),0.03)] text-apptext " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-300";

// La interfaz de Props se mantiene (recibe 'pitcher' y 'onClose')
interface EditPitcherModalProps {
  pitcher: Pitcher | null;
  onClose: () => void;
}

export default function EditPitcherModal({ pitcher, onClose }: EditPitcherModalProps) {
  // --- La lógica de useForm y los hooks se mantiene ---
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreatePitcherDto>();
  
  const { update: updatePitcher } = usePitchers();
  const { list: equiposList } = useEquipos();

  // --- El useEffect se mantiene (es la lógica de "Editar") ---
  useEffect(() => {
    if (pitcher) {
      setValue("nombre", pitcher.nombre);
      setValue("apellido", pitcher.apellido);
      setValue("edad", pitcher.edad);
      setValue("numero_camiseta", pitcher.numero_camiseta);
      setValue("equipoId", pitcher.equipoId);
    } else {
      reset();
    }
  }, [pitcher, setValue, reset]);

  // --- El onSubmit se mantiene (usa 'update' en lugar de 'create') ---
  const onSubmit: SubmitHandler<CreatePitcherDto> = async (data) => {
    if (!pitcher) return;

    await toast.promise(
      updatePitcher.mutateAsync({ id: pitcher.id, data }),
      {
        loading: 'Actualizando pitcher...',
        success: '¡Pitcher actualizado con éxito!',
        error: 'No se pudo actualizar el pitcher.',
      }
    );
    
    onClose(); // Cerramos el modal usando la prop
  };
  
  // Si no hay pitcher seleccionado, no mostramos nada
  if (!pitcher) {
    return null;
  }

  return (
    <Modal
      open={!!pitcher}
      onClose={onClose}
      title={<div className="flex items-center gap-3"><PencilIcon className="h-6 w-6 text-apptext"/> <span>Editar Pitcher</span></div>}
      size="md"
      footer={
          <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" form="edit-pitcher-form" variant="primary" disabled={updatePitcher.isPending}>
            {updatePitcher.isPending ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </div>
      }
    >
      <form id="edit-pitcher-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="p-4 sm:p-6 space-y-4"> {/* Eliminamos bg-gray-50 de aquí para que sea blanco */}

            {/* Campo Nombre (Full-width) */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-apptext">Nombre</label>
              <input
                id="nombre"
                type="text"
                {...register("nombre", { required: "El nombre es obligatorio" })}
                className={inputStyle}
                style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              />
              {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
            </div>

            {/* Campo Apellido (Full-width) */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-apptext">Apellido</label>
              <input
                id="apellido"
                type="text"
                {...register("apellido", { required: "El apellido es obligatorio" })}
                className={inputStyle}
                style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
              />
              {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido.message}</p>}
            </div>

            {/* Edad y Número (Grid 2 columnas) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edad" className="block text-sm font-medium text-apptext">Edad</label>
                <input
                  id="edad"
                  type="number"
                  {...register("edad", { required: "La edad es obligatoria", valueAsNumber: true, min: { value: 1, message: "Edad inválida" } })}
                className={inputStyle}
                style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                />
                {errors.edad && <p className="mt-1 text-xs text-red-500">{errors.edad.message}</p>}
              </div>
              <div>
                <label htmlFor="numero_camiseta" className="block text-sm font-medium text-apptext">Número</label>
                <input
                  id="numero_camiseta"
                  type="number"
                  {...register("numero_camiseta", { required: "El número es obligatorio", valueAsNumber: true, min: { value: 0, message: "Número inválido" } })}
                className={inputStyle}
                style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                />
                {errors.numero_camiseta && <p className="mt-1 text-xs text-red-500">{errors.numero_camiseta.message}</p>}
              </div>
            </div>

            {/* Selector de Equipo (Full-width) */}
            <div>
              <label htmlFor="equipoId" className="block text-sm font-medium text-apptext">Equipo</label>
              <select
                id="equipoId"
                {...register("equipoId", { required: "Debe seleccionar un equipo", valueAsNumber: true })}
                className={inputStyle}
                style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
                disabled={equiposList.isLoading}
              >
                <option value="">
                  {equiposList.isLoading ? "Cargando equipos..." : "Seleccione un equipo"}
                </option>
                {equiposList.data?.map(equipo => (
                  <option key={equipo.id} value={equipo.id} style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}>
                    {equipo.nombre}
                  </option>
                ))}
              </select>
              {errors.equipoId && <p className="mt-1 text-xs text-red-500">{errors.equipoId.message}</p>}
            </div>
          </div>
      </form>
    </Modal>
  );
}