// app/(private)/pitchers/page.tsx
"use client";

import { useState } from "react";
import { usePitchers } from "@/hooks/usePitchers";
import type { Pitcher } from "@/types/pitcher";
import NewPitcherModal from "./NewPitcherModal";
import EditPitcherModal from "./EditPitcherModal";

// 👇 sumamos el ícono de usuario
import { PencilIcon, TrashIcon, UserIcon } from "@heroicons/react/24/solid";

/** Avatar reutilizable con fallback a ícono */
function Avatar({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  // si viene una foto, la mostramos; si falla o no hay, queda el ícono
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-white object-cover shadow-md bg-white"
        onError={(e) => {
          // si la URL no carga, ocultamos la imagen para que se vea el ícono de fondo
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }

  // default avatar (ícono)
  return (
    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-200 shadow-md">
      <UserIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />
    </div>
  );
}

export default function PitchersPage() {
  const { list, remove } = usePitchers();
  const [pitcherAEditar, setPitcherAEditar] = useState<Pitcher | null>(null);

  if (list.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#90D1F2] to-[#012F8A]">
        <p className="text-2xl font-bold text-white">Cargando pitchers...</p>
      </div>
    );
  }

  if (list.isError) {
    return <p>Error: {(list.error as Error).message}</p>;
  }

  const pitchers = list.data ?? [];

  return (
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 pb-10 font-sans sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between pb-8">
          <h1 className="text-4xl font-bold text-white" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}>
            Pitchers
          </h1>
          <NewPitcherModal />
        </header>

        {pitchers.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {pitchers.map((p) => (
              <div
                key={p.id}
                className="group relative flex transform flex-col rounded-2xl bg-white p-6 text-center shadow-xl transition-transform duration-300 hover:-translate-y-2"
              >
                {/* 👇 acá usamos el avatar (sin foto por ahora) */}
                <Avatar
                  // si en el futuro tenés campo foto: src={p.fotoUrl ?? p.foto_url}
                  alt={`Foto de ${p.nombre} ${p.apellido}`}
                />

                <h2 className="text-2xl font-bold text-gray-800">
                  {p.nombre} {p.apellido}
                </h2>
                <p className="text-md text-gray-500">{p.equipo?.nombre ?? "Sin equipo"}</p>
                <p className="mt-2 text-sm font-semibold text-gray-400">#{p.numero_camiseta}</p>

                <div className="absolute top-4 right-4 flex scale-0 space-x-2 transition-transform duration-200 group-hover:scale-100">
                  <button
                    onClick={() => setPitcherAEditar(p)}
                    className="rounded-full bg-sky-600 p-2 text-white shadow-md hover:bg-sky-700"
                    title="Editar"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    className="rounded-full bg-red-600 p-2 text-white shadow-md hover:bg-red-700"
                    title="Borrar"
                    onClick={() => {
                      if (confirm(`¿Seguro que quieres eliminar a ${p.nombre} ${p.apellido}?`)) {
                        remove.mutate(p.id);
                      }
                    }}
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-lg bg-white/20">
            <p className="text-xl text-white">No hay pitchers registrados todavía.</p>
          </div>
        )}

        <EditPitcherModal pitcher={pitcherAEditar} onClose={() => setPitcherAEditar(null)} />
      </div>
    </main>
  );
}
