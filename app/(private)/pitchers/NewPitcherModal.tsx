// app/(private)/pitchers/NewPitcherModal.tsx
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { usePitchers } from "@/hooks/usePitchers";
import { useEquipos } from "@/hooks/useEquipos";
import { CreatePitcherDto } from "@/lib/api";
import { toast } from "react-hot-toast"; // 1. Importamos toast
import { PlusIcon } from "@heroicons/react/24/solid"; // Opcional: para el botón

export default function NewPitcherModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreatePitcherDto>();
  const { create: createPitcher } = usePitchers();
  const { list: equiposList } = useEquipos();

  const onSubmit: SubmitHandler<CreatePitcherDto> = async (data) => {
    // 2. Usamos toast.promise para una mejor experiencia de usuario
    // Muestra un mensaje mientras se guarda, y luego lo actualiza con el resultado.
    await toast.promise(
      createPitcher.mutateAsync(data),
      {
        loading: 'Guardando pitcher...',
        success: '¡Pitcher creado con éxito!',
        error: 'No se pudo crear el pitcher.',
      }
    );

    // Limpiamos y cerramos el modal después de que la promesa se complete
    reset();
    setIsOpen(false);
  };

  const closeModal = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <>
      {/* 3. Estilizamos el botón para que coincida con el diseño de la app */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 rounded-full bg-white px-5 py-2 font-bold text-[#012F8A] shadow-lg transition-transform duration-300 hover:-translate-y-1"
      >
        <PlusIcon className="h-5 w-5" />
        Nuevo Pitcher
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-2xl font-bold">Añadir Nuevo Pitcher</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Campo Nombre */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  {...register("nombre", { required: "El nombre es obligatorio" })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.nombre && <p className="mt-1 text-xs text-red-500">{errors.nombre.message}</p>}
              </div>

              {/* Campo Apellido */}
              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  {...register("apellido", { required: "El apellido es obligatorio" })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                {errors.apellido && <p className="mt-1 text-xs text-red-500">{errors.apellido.message}</p>}
              </div>
              
              {/* Campos Edad y Número en la misma fila */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="edad" className="block text-sm font-medium text-gray-700">Edad</label>
                  <input
                    id="edad"
                    type="number"
                    {...register("edad", { required: "La edad es obligatoria", valueAsNumber: true, min: { value: 1, message: "Edad inválida"} })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.edad && <p className="mt-1 text-xs text-red-500">{errors.edad.message}</p>}
                </div>
                <div>
                  <label htmlFor="numero_camiseta" className="block text-sm font-medium text-gray-700">Número</label>
                  <input
                    id="numero_camiseta"
                    type="number"
                    {...register("numero_camiseta", { required: "El número es obligatorio", valueAsNumber: true, min: { value: 0, message: "Número inválido"} })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {errors.numero_camiseta && <p className="mt-1 text-xs text-red-500">{errors.numero_camiseta.message}</p>}
                </div>
              </div>

              {/* Selector de Equipo */}
              <div>
                <label htmlFor="equipoId" className="block text-sm font-medium text-gray-700">Equipo</label>
                <select
                  id="equipoId"
                  {...register("equipoId", { required: "Debe seleccionar un equipo", valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createPitcher.isPending}
                  className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700 disabled:opacity-50"
                >
                  {createPitcher.isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}