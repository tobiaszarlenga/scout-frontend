"use client";

import { useState } from "react";
import { useEquipos } from "hooks/useEquipos";
import NewEquipoModal from "./NewEquipoModal";
import EditEquipoModal from "@/app/(private)/equipos/EditEquipoModal";
import type { Equipo } from "@/types/equipo";
import { toast } from "react-hot-toast";
import { PencilIcon, TrashIcon, UsersIcon } from "@heroicons/react/24/solid";

// 🎨 Paleta unificada (igual que en el dashboard)
const COLORS = {
  bgFrom: "#1F2F40",
  bgTo: "#15202B",
  card: "#22313F",
  text: "#DDE2E5",
  accent: "#E04E0E",
  edit: "#3B82F6", // Azul celeste para el botón Editar
};

export default function EquiposPage() {
  const { list, remove, update } = useEquipos();
  const [equipoAEditar, setEquipoAEditar] = useState<Equipo | null>(null);

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

  if (list.isLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        style={{
          background: `linear-gradient(180deg, ${COLORS.bgFrom}, ${COLORS.bgTo})`,
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
        background: `linear-gradient(180deg, ${COLORS.bgFrom}, ${COLORS.bgTo})`,
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* HEADER */}
        <header className="flex items-center justify-between pb-8">
          <h1 className="text-4xl font-bold" style={{ color: COLORS.text }}>
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
                backgroundColor: COLORS.card,
              }}
            >
              <div className="flex items-center gap-3">
                {/* Ícono de equipo con fondo naranja */}
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: COLORS.accent }}
                >
                  <UsersIcon className="h-6 w-6" style={{ color: COLORS.bgTo }} />
                </div>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: COLORS.text }}
                  >
                    {e.nombre}
                  </h2>
                  <p className="text-sm" style={{ color: "#A0A8AD" }}>
                    {e.ciudad || "Sin ciudad"}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="text-center">
                  <div
                    className="text-xl font-extrabold"
                    style={{ color: COLORS.accent }}
                  >
                    {e._count?.pitchers ?? 0}
                  </div>
                  <div
                    className="text-xs uppercase tracking-wide"
                    style={{ color: "#A0A8AD" }}
                  >
                    Pitchers
                  </div>
                </div>

                {/* BOTONES */}
                <div className="flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button
                    onClick={() => handleOpenEditModal(e)}
                    className="rounded-full p-2 text-white shadow-md transition hover:scale-110"
                    style={{ backgroundColor: COLORS.edit }}
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="rounded-full bg-red-600 p-2 text-white shadow-md transition hover:scale-110"
                    title="Borrar"
                    onClick={() => {
                      if (
                        confirm(
                          `¿Seguro que quieres eliminar al equipo ${e.nombre}?`
                        )
                      ) {
                        remove.mutate(e.id);
                      }
                    }}
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
              style={{ backgroundColor: COLORS.card, color: COLORS.text }}
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
      </div>
    </main>
  );
}
