"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from 'next/image';
import { usePitchers } from "@/hooks/usePitchers";
import type { Pitcher } from "@/types/pitcher";
import NewPitcherModal from "./NewPitcherModal";
import EditPitcherModal from "./EditPitcherModal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { PencilIcon, TrashIcon, UserIcon } from "@heroicons/react/24/solid";
import { toast } from "react-hot-toast";

// 🎨 Paleta del dashboard (usa variables globales)
const COLORS = {
  bgFrom: 'var(--color-sidebar)',
  bgTo: 'var(--color-sidebar)',
  card: 'var(--color-card)',
  text: 'var(--color-text)',
  accent: 'var(--color-accent)',
  edit: '#3B82F6', // azul celeste
};

function Avatar({ src, alt }: { src?: string | null; alt: string }) {
  const [imgError, setImgError] = useState(false);

  if (src && !imgError) {
    return (
      <div
        className="mx-auto mb-4 h-24 w-24 rounded-full border-4 overflow-hidden shadow-md"
        style={{
          borderColor: 'var(--color-card)',
          backgroundColor: COLORS.accent,
        }}
      >
        <Image
          src={src}
          alt={alt}
          width={96}
          height={96}
          className="rounded-full object-cover"
          onError={() => setImgError(true)}
          unoptimized
        />
      </div>
    );
  }

  // --- SIN FOTO: fondo naranja dinámico ---
  return (
    <div
      className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 shadow-md"
      style={{
        borderColor: 'var(--color-card)',
        backgroundColor: COLORS.accent,
      }}
    >
      <UserIcon className="h-12 w-12" style={{ color: 'var(--color-card)' }} />
    </div>
  );
}

export default function PitchersPage() {
  const router = useRouter();
  const { list, remove } = usePitchers();
  const [pitcherAEditar, setPitcherAEditar] = useState<Pitcher | null>(null);
  const [pitcherAEliminar, setPitcherAEliminar] = useState<Pitcher | null>(null);
  const pitchers = useMemo(() => list.data ?? [], [list.data]);

  const pitchersPorEquipo = useMemo(() => {
    return (pitchers || []).reduce((acc, pitcher) => {
      const equipoKey = pitcher.equipo?.nombre ?? "Sin equipo";
      if (!acc[equipoKey]) acc[equipoKey] = [];
      acc[equipoKey].push(pitcher);
      return acc;
    }, {} as Record<string, Pitcher[]>);
  }, [pitchers]);

  const handleDeletePitcher = async () => {
    if (!pitcherAEliminar) return;

    try {
      await remove.mutateAsync(pitcherAEliminar.id);
      toast.success(`${pitcherAEliminar.nombre} ${pitcherAEliminar.apellido} ha sido eliminado`);
      setPitcherAEliminar(null);
    } catch (error) {
      // Manejar el error de manera más amigable
      const errorMessage = error instanceof Error ? error.message : "Error al eliminar el pitcher";
      
      if (errorMessage.includes("lanzamientos") || errorMessage.includes("partidos") || errorMessage.includes("referencia")) {
        toast.error(
          `No se puede eliminar a ${pitcherAEliminar.nombre} ${pitcherAEliminar.apellido} porque tiene lanzamientos registrados en partidos.`,
          { duration: 5000 }
        );
      } else {
        toast.error(errorMessage);
      }
      setPitcherAEliminar(null);
    }
  };

  if (list.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg">
        <p className="text-2xl font-bold text-apptext">Cargando pitchers...</p>
      </div>
    );
  }

  if (list.isError) return <p>Error: {(list.error as Error).message}</p>;

  return (
    <main className="min-h-full w-full max-w-full overflow-x-hidden px-6 py-6 pb-10 font-sans sm:px-10 sm:py-8 bg-bg text-apptext">
      <div className="mx-auto w-full max-w-6xl">
        {/* HEADER */}
        <header className="flex items-center justify-between pb-8">
          <h1 className="text-4xl font-bold text-apptext">Pitchers</h1>
          <NewPitcherModal />
        </header>

        {pitchers.length > 0 ? (
          <div className="flex flex-col gap-10">
            {Object.keys(pitchersPorEquipo).map((nombreEquipo) => (
              <section key={nombreEquipo}>
                <h2 className="mb-4 text-2xl font-bold capitalize text-apptext">
                  {nombreEquipo}
                </h2>

                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {pitchersPorEquipo[nombreEquipo].map((p) => (
                    <div
                      key={p.id}
                      className="group relative flex flex-col rounded-2xl p-6 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 bg-card text-apptext cursor-pointer"
                      onClick={() => router.push(`/reportes/${p.id}`)}
                      style={{
                        border: '2px solid transparent',
                      }}
                      onMouseEnter={(el) => {
                        el.currentTarget.style.border = '2px solid var(--color-accent)';
                        el.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(207, 83, 0, 0.25), 0 0 20px rgba(207, 83, 0, 0.2)';
                      }}
                      onMouseLeave={(el) => {
                        el.currentTarget.style.border = '2px solid transparent';
                        el.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                      }}
                    >
                      <Avatar
                        // src={p.fotoUrl ?? p.foto_url}
                        alt={`Foto de ${p.nombre} ${p.apellido}`}
                      />

                      <h3 className="text-2xl font-bold">
                        {p.nombre} {p.apellido}
                      </h3>
                      <p className="text-md" style={{ color: "var(--color-text)" }}>
                        {p.equipo?.nombre ?? "Sin equipo"}
                      </p>
                      <p
                        className="mt-2 text-sm font-semibold"
                        style={{ color: "var(--color-text)" }}
                      >
                        #{p.numero_camiseta}
                      </p>

                      {/* Botones */}
                      <div className="absolute top-4 right-4 flex scale-0 gap-2 transition-transform duration-200 group-hover:scale-100">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPitcherAEditar(p);
                          }}
                          className="rounded-full p-2 text-white shadow-md transition hover:scale-110"
                          style={{ backgroundColor: COLORS.edit }}
                          title="Editar"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          className="rounded-full bg-red-600 p-2 text-white shadow-md transition hover:scale-110"
                          title="Borrar"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPitcherAEliminar(p);
                          }}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div
            className="flex h-64 items-center justify-center rounded-xl"
            style={{ backgroundColor: `var(--color-card)` }}
          >
            <p className="text-xl" style={{ color: COLORS.text }}>
              No hay pitchers registrados todavía.
            </p>
          </div>
        )}

        <EditPitcherModal
          pitcher={pitcherAEditar}
          onClose={() => setPitcherAEditar(null)}
        />

        <ConfirmDialog
          open={pitcherAEliminar !== null}
          title="Eliminar Pitcher"
          message={`¿Estás seguro de que deseas eliminar a ${pitcherAEliminar?.nombre} ${pitcherAEliminar?.apellido}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={handleDeletePitcher}
          onCancel={() => setPitcherAEliminar(null)}
        />
      </div>
    </main>
  );
}
