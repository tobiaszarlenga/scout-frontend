// app/(private)/pitchers/NewPitcherModal.tsx
"use client";

import { useState } from "react";
import Modal from '@/app/components/Modal';
import Button from '@/app/components/Button';
import { useForm, SubmitHandler } from "react-hook-form";
import { usePitchers } from "@/hooks/usePitchers";
import { useEquipos } from "@/hooks/useEquipos";
import type { CreatePitcherDto } from "@/types/pitcher";
import { toast } from "react-hot-toast";
import { PlusIcon, UserPlusIcon } from "@heroicons/react/24/solid";

// CAMBIO: Colores de focus actualizados a AZUL
const inputStyle =
  "mt-1 block w-full rounded-md border-gray-300 shadow-sm " +
  "bg-gray-100 " +
  "focus:border-blue-500 focus:ring-2 focus:ring-blue-300"; // <-- CAMBIO a AZUL

export default function NewPitcherModal() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreatePitcherDto>();
  const { create: createPitcher } = usePitchers();
  const { list: equiposList } = useEquipos();

  const onSubmit: SubmitHandler<CreatePitcherDto> = async (data) => {
    await toast.promise(createPitcher.mutateAsync(data), {
      loading: "Guardando pitcher...",
      success: "¡Pitcher creado con éxito!",
      error: "No se pudo crear el pitcher.",
    });
    reset();
    setIsOpen(false);
  };

  const closeModal = () => {
    reset();
    setIsOpen(false);
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="secondary" className="flex items-center gap-2 rounded-full">
        <PlusIcon className="h-5 w-5 text-accent" />
        <span className="text-accent font-bold">Nuevo Pitcher</span>
      </Button>

      <Modal
        open={isOpen}
        onClose={closeModal}
        title={
          <div className="flex items-center gap-3">
            <UserPlusIcon className="h-6 w-6 text-apptext" />
            <span>Añadir Nuevo Pitcher</span>
          </div>
        }
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancelar
            </Button>
            <Button type="submit" form="new-pitcher-form" variant="primary" className="bg-blue-500 hover:bg-blue-700" disabled={createPitcher.isPending}>
              {createPitcher.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        }
      >
        <form id="new-pitcher-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="p-4 sm:p-6 space-y-4">
                {/* Campo Nombre */}
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

                {/* Campo Apellido */}
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

                {/* Edad y Número */}
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

                {/* Selector de Equipo */}
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
        </form>
      </Modal>
    </>
  );
}