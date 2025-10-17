// app/(private)/pitchers/NewPitcherModal.tsx
"use client";

import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { usePitchers } from "@/hooks/usePitchers";
import { useEquipos } from "@/hooks/useEquipos";
import { CreatePitcherDto } from "@/lib/api";

export default function NewPitcherModal() {
  // Estado para controlar la visibilidad del modal
  const [isOpen, setIsOpen] = useState(false);

  // Hook de react-hook-form para manejar el estado del formulario
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePitcherDto>();

  // Hooks de React Query para interactuar con la API
  const { create: createPitcher } = usePitchers();
  const { list: equiposList } = useEquipos();

  // Función que se ejecuta al enviar el formulario
  const onSubmit: SubmitHandler<CreatePitcherDto> = async (data) => {
    try {
      await createPitcher.mutateAsync(data);
      alert("Pitcher creado con éxito!");
      reset(); // Limpiamos el formulario
      setIsOpen(false); // Cerramos el modal
    } catch (error) {
      alert("Error al crear el pitcher.");
      console.error(error);
    }
  };

  return (
    <>
      {/* Botón para abrir el modal */}
      <button
        onClick={() => setIsOpen(true)}
        className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700"
      >
        Nuevo Pitcher
      </button>

      {/* El Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Añadir Nuevo Pitcher</h2>
            
            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  id="nombre"
                  type="text"
                  {...register("nombre", { required: "El nombre es obligatorio" })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.nombre && <p className="text-red-500 text-xs mt-1">{errors.nombre.message}</p>}
              </div>

              <div>
                <label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</label>
                <input
                  id="apellido"
                  type="text"
                  {...register("apellido", { required: "El apellido es obligatorio" })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.apellido && <p className="text-red-500 text-xs mt-1">{errors.apellido.message}</p>}
              </div>
              
              <div>
                <label htmlFor="edad" className="block text-sm font-medium text-gray-700">Edad</label>
                <input
                  id="edad"
                  type="number"
                  {...register("edad", { required: "La edad es obligatoria", valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.edad && <p className="text-red-500 text-xs mt-1">{errors.edad.message}</p>}
              </div>

              <div>
                <label htmlFor="numero_camiseta" className="block text-sm font-medium text-gray-700">Número de Camiseta</label>
                <input
                  id="numero_camiseta"
                  type="number"
                  {...register("numero_camiseta", { required: "El número es obligatorio", valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
                {errors.numero_camiseta && <p className="text-red-500 text-xs mt-1">{errors.numero_camiseta.message}</p>}
              </div>

              <div>
                <label htmlFor="equipoId" className="block text-sm font-medium text-gray-700">Equipo</label>
                <select
                  id="equipoId"
                  {...register("equipoId", { required: "Debe seleccionar un equipo", valueAsNumber: true })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
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
                {errors.equipoId && <p className="text-red-500 text-xs mt-1">{errors.equipoId.message}</p>}
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    reset();
                    setIsOpen(false);
                  }}
                  className="rounded bg-gray-200 px-4 py-2 font-semibold text-gray-800 hover:bg-gray-300"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createPitcher.isPending}
                  className="rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-blue-300"
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