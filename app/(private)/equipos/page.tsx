"use client";

import { useState } from "react";
import { useEquipos } from "hooks/useEquipos";
import NewEquipoModal from "./NewEquipoModal";
import EditEquipoModal from "@/app/(private)/equipos/EditEquipoModal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import type { Equipo } from "@/types/equipo";
import { toast } from "react-hot-toast";
import { PencilIcon, TrashIcon, UsersIcon } from "@heroicons/react/24/solid";

export default function EquiposPage() {
  const { list, remove, update } = useEquipos();
  const [equipoAEditar, setEquipoAEditar] = useState<Equipo | null>(null);
  const [equipoAEliminar, setEquipoAEliminar] = useState<Equipo | null>(null);

  const handleOpenEditModal = (equipo: Equipo) => setEquipoAEditar(equipo);
  const handleCloseEditModal = () => setEquipoAEditar(null);

  const handleSaveEquipo = async (values: Equipo) => {
    const dataToUpdate = { nombre: values.nombre, ciudad: values.ciudad };

    await toast.promise(
      update.mutateAsync({ id: values.id, data: dataToUpdate }),
      {
        loading: "Actualizando equipo...",
        success: `Equipo "${values.nombre}" actualizado con éxito.`,
        error: "No se pudo actualizar el equipo.",
      }
    );
    handleCloseEditModal();
  };

  const handleDeleteEquipo = async () => {
    if (!equipoAEliminar) return;

    try {
      await remove.mutateAsync(equipoAEliminar.id);
      toast.success(`El equipo "${equipoAEliminar.nombre}" ha sido eliminado`);
      setEquipoAEliminar(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el equipo";
      
      if (errorMessage.includes("pitchers") || errorMessage.includes("partidos") || errorMessage.includes("referencia")) {
        toast.error(
          `No se puede eliminar el equipo "${equipoAEliminar.nombre}" porque tiene pitchers o partidos asociados.`,
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }
      setEquipoAEliminar(null);
    }
  };

  if (list.isLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{
          backgroundColor: 'var(--color-sidebar)',
        }}
      >
        <p className="text-2xl font-bold text-slate-100">Cargando equipos…</p>
      </div>
    );
  }
  if (list.isError) return <p>Error: {(list.error as Error).message}</p>;

  const equipos = list.data ?? [];

  return (
    <main
      className="min-h-full w-full max-w-full overflow-x-hidden px-6 py-8 font-sans"
      style={{
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* HEADER */}
        <header className="flex items-center justify-between pb-8">
          <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
            Equipos
          </h1>
          <NewEquipoModal />
        </header>

        {/* GRID FLUIDA */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {equipos.map((e) => (
            <div
              key={e.id}
              className="group flex flex-col justify-between rounded-2xl p-4 shadow-lg ring-1 ring-white/5 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
              style={{
                backgroundColor: 'var(--color-card)',
              }}
            >
              <div className="flex items-center gap-3">
                {/* Ícono de equipo con fondo naranja */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: 'var(--color-accent)' }}
                >
                  <UsersIcon className="h-6 w-6" style={{ color: 'var(--color-card)' }} />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {e.nombre}
                  </h2>
                  <p className="text-sm" style={{ color: "var(--color-text)" }}>
                    {e.ciudad || "Sin ciudad"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-center">
                  <div
                    className="text-xl font-extrabold"
                    style={{ color: 'var(--color-accent)' }}
                  >
                    {e._count?.pitchers ?? 0}
                  </div>
                    <div
                    className="text-xs uppercase tracking-wide"
                    style={{ color: "var(--color-text)" }}
                  >
                    Pitchers
                  </div>
                </div>

                {/* BOTONES */}
                <div className="flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    onClick={() => handleOpenEditModal(e)}
                    className="rounded-full p-2 text-white shadow-md transition hover:scale-110"
                    style={{ backgroundColor: '#3B82F6' }}
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="rounded-full bg-red-600 p-2 text-white shadow-md transition hover:scale-110"
                    title="Borrar"
                    onClick={() => setEquipoAEliminar(e)}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {equipos.length === 0 && (
            <div
              className="col-span-full rounded-2xl p-10 text-center ring-1 ring-white/5"
              style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)' }}
            >
              No hay equipos registrados. ¡Crea el primero!
            </div>
          )}
        </section>

        {/* MODAL DE EDICIÓN */}
        <EditEquipoModal
          open={equipoAEditar !== null}
          equipo={equipoAEditar}
          onClose={handleCloseEditModal}
          onSave={handleSaveEquipo}
        />

        {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
        <ConfirmDialog
          open={equipoAEliminar !== null}
          title="Eliminar Equipo"
          message={`¿Estás seguro de que deseas eliminar el equipo "${equipoAEliminar?.nombre}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={handleDeleteEquipo}
          onCancel={() => setEquipoAEliminar(null)}
        />
      </div>
    </main>
  );
}
