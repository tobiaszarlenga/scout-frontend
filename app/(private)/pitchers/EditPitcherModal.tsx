// app/(private)/pitchers/EditPitcherModal.tsx
"use client";

import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { usePitchers } from "@/hooks/usePitchers";
import { useEquipos } from "@/hooks/useEquipos";
import type { Pitcher, CreatePitcherDto } from "@/types/pitcher";
import { toast } from "react-hot-toast";

// --- CAMBIO 1: Importamos el ícono de Editar ---
import { PencilIcon } from "@heroicons/react/24/solid";

// --- CAMBIO 2: Copiamos la variable de estilos de NewPitcherModal ---
const inputStyle =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm " +
  "bg-gray-100 " +
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

  // --- CAMBIO 3: Usamos el JSX de NewPitcherModal ---
  // (Reemplazamos 'isOpen' por la comprobación de 'pitcher')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden">
        
        {/* Cabezal AZUL (igual que New, pero con ícono y texto de Editar) */}
        <div className="flex items-center gap-3 bg-blue-500 p-4 text-white">
          <PencilIcon className="h-7 w-7" />
          <h2 className="text-xl font-bold">Editar Pitcher</h2>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Cuerpo del formulario (con padding y fondo gris) */}
          <div className="p-6 space-y-4"> {/* Eliminamos bg-gray-50 de aquí para que sea blanco */}

            {/* Campo Nombre (Full-width) */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                id="nombre"
                type="text"
                {...register("nombre", { required: "El nombre es obligatorio" })}
                className={inputStyle}
              />
              {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
            </div>

            {/* Campo Apellido (Full-width) */}
            <div>
              <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                id="apellido"
                type="text"
                {...register("apellido", { required: "El apellido es obligatorio" })}
                className={inputStyle}
              />
              {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido.message}</p>}
            </div>

            {/* Edad y Número (Grid 2 columnas) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edad" className="block text-sm font-medium text-gray-700">Edad</label>
                <input
                  id="edad"
                  type="number"
                  {...register("edad", { required: "La edad es obligatoria", valueAsNumber: true, min: { value: 1, message: "Edad inválida" } })}
                  className={inputStyle}
                />
                {errors.edad && <p className="mt-1 text-xs text-red-500">{errors.edad.message}</p>}
              </div>
              <div>
                <label htmlFor="numero_camiseta" className="block text-sm font-medium text-gray-700">Número</label>
                <input
                  id="numero_camiseta"
                  type="number"
                  {...register("numero_camiseta", { required: "El número es obligatorio", valueAsNumber: true, min: { value: 0, message: "Número inválido" } })}
                  className={inputStyle}
                />
                {errors.numero_camiseta && <p className="mt-1 text-xs text-red-500">{errors.numero_camiseta.message}</p>}
              </div>
            </div>

            {/* Selector de Equipo (Full-width) */}
            <div>
              <label htmlFor="equipoId" className="block text-sm font-medium text-gray-700">Equipo</label>
              <select
                id="equipoId"
                {...register("equipoId", { required: "Debe seleccionar un equipo", valueAsNumber: true })}
                className={inputStyle}
                disabled={equiposList.isLoading}
              >
                <option value="">
                  {equiposList.isLoading ? "Cargando equipos..." : "Seleccione un equipo"}
                </option>
                {equiposList.data?.map(equipo => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre}
                  </option>
                ))}
              </select>
              {errors.equipoId && <p className="mt-1 text-xs text-red-500">{errors.equipoId.message}</p>}
            </div>
          </div>

          {/* Pie de página (con fondo gris y botones) */}
          <div className="flex justify-end space-x-3 bg-gray-50 p-4">
            <button
              type="button"
              onClick={onClose} // Usamos la prop 'onClose'
              className="rounded-lg px-4 py-2 font-semibold text-gray-700 hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updatePitcher.isPending}
              className="rounded-lg bg-blue-500 px-4 py-2 font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {updatePitcher.isPending ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}