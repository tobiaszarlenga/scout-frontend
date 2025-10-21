// app/(private)/pitchers/EditPitcherModal.tsx
"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { usePitchers } from "@/hooks/usePitchers";
import { useEquipos } from "@/hooks/useEquipos";
import type { Pitcher, CreatePitcherDto } from "@/types/pitcher";
import { toast } from "react-hot-toast"; // 1. Importamos toast

interface EditPitcherModalProps {
  pitcher: Pitcher | null;
  onClose: () => void;
}

export default function EditPitcherModal({ pitcher, onClose }: EditPitcherModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreatePitcherDto>();
  
  const { update: updatePitcher } = usePitchers();
  const { list: equiposList } = useEquipos();

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

  // 2. Reemplazamos la lógica del 'onSubmit' por toast.promise
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
    
    onClose(); // Cerramos el modal después de que la operación termine
  };
  
  if (!pitcher) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-2xl font-bold">Editar Pitcher</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Campo Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input id="nombre" type="text" {...register("nombre", { required: "El nombre es obligatorio" })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
          </div>

          {/* Campo Apellido */}
          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
            <input id="apellido" type="text" {...register("apellido", { required: "El apellido es obligatorio" })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido.message}</p>}
          </div>

          {/* ... (el resto de los campos del formulario no cambian) ... */}
            <div>
            <label htmlFor="edad" className="block text-sm font-medium text-gray-700">Edad</label>
            <input id="edad" type="number" {...register("edad", { required: "La edad es obligatoria", valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            {errors.edad && <p className="text-red-500 text-xs mt-1">{errors.edad.message}</p>}
          </div>

          <div>
            <label htmlFor="numero_camiseta" className="block text-sm font-medium text-gray-700">Número de Camiseta</label>
            <input id="numero_camiseta" type="number" {...register("numero_camiseta", { required: "El número es obligatorio", valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            {errors.numero_camiseta && <p className="text-red-500 text-xs mt-1">{errors.numero_camiseta.message}</p>}
          </div>

          <div>
            <label htmlFor="equipoId" className="block text-sm font-medium text-gray-700">Equipo</label>
            <select id="equipoId" {...register("equipoId", { required: "Debe seleccionar un equipo", valueAsNumber: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" disabled={equiposList.isLoading}>
              <option value="">{equiposList.isLoading ? "Cargando..." : "Seleccione"}</option>
              {equiposList.data?.map(equipo => (
                <option key={equipo.id} value={equipo.id}>{equipo.nombre}</option>
              ))}
            </select>
            {errors.equipoId && <p className="text-red-500 text-xs mt-1">{errors.equipoId.message}</p>}
          </div>


          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={updatePitcher.isPending} className="rounded-md bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
              {updatePitcher.isPending ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}