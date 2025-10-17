// app/(private)/pitchers/EditPitcherModal.tsx
"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { usePitchers } from "@/hooks/usePitchers";
import { useEquipos } from "@/hooks/useEquipos";
import type { Pitcher, CreatePitcherDto } from "@/lib/api";

// Definimos los props que recibirá el componente
interface EditPitcherModalProps {
  pitcher: Pitcher | null; // El pitcher a editar, o null si el modal está cerrado
  onClose: () => void; // Función para cerrar el modal
}

export default function EditPitcherModal({ pitcher, onClose }: EditPitcherModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue, // Función de react-hook-form para setear valores
    formState: { errors },
  } = useForm<CreatePitcherDto>();
  
  const { update: updatePitcher } = usePitchers();
  const { list: equiposList } = useEquipos();

  // --- LA MAGIA ESTÁ AQUÍ ---
  // Este efecto se ejecuta cada vez que el 'pitcher' que llega por props cambia.
  useEffect(() => {
    if (pitcher) {
      // Si hay un pitcher para editar, llenamos el formulario con sus datos.
      setValue("nombre", pitcher.nombre);
      setValue("apellido", pitcher.apellido);
      setValue("edad", pitcher.edad);
      setValue("numero_camiseta", pitcher.numero_camiseta);
      setValue("equipoId", pitcher.equipoId);
    } else {
      // Si no hay pitcher (modal cerrado), limpiamos el formulario.
      reset();
    }
  }, [pitcher, setValue, reset]);


  const onSubmit: SubmitHandler<CreatePitcherDto> = async (data) => {
    if (!pitcher) return; // Seguridad: no hacer nada si no hay pitcher

    try {
      await updatePitcher.mutateAsync({ id: pitcher.id, data });
      alert("Pitcher actualizado con éxito!");
      onClose(); // Cerramos el modal
    } catch (error) {
      alert("Error al actualizar el pitcher.");
      console.error(error);
    }
  };
  
  // Si no hay pitcher, no renderizamos el modal.
  if (!pitcher) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Editar Pitcher</h2>
        
        {/* El formulario es idéntico al de creación */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
            <input id="nombre" type="text" {...register("nombre", { required: "El nombre es obligatorio" })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
          </div>

          <div>
            <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
            <input id="apellido" type="text" {...register("apellido", { required: "El apellido es obligatorio" })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" />
            {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
          </div>

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
            <button type="button" onClick={onClose} className="rounded bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300">
              Cancelar
            </button>
            <button type="submit" disabled={updatePitcher.isPending} className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300">
              {updatePitcher.isPending ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}