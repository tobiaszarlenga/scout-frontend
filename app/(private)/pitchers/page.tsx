// app/(private)/pitchers/page.tsx
"use client";

// --- CAMBIO 1: Importamos useMemo ---
import { useState, useMemo } from "react";
import { usePitchers } from "@/hooks/usePitchers";
import type { Pitcher } from "@/types/pitcher";
import NewPitcherModal from "./NewPitcherModal";
import EditPitcherModal from "./EditPitcherModal";

import { PencilIcon, TrashIcon, UserIcon } from "@heroicons/react/24/solid";

/** Avatar reutilizable con fallback a ícono (Tu componente, sin cambios) */
function Avatar({
  src,
  alt,
}: {
  src?: string | null;
  alt: string;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-white object-cover shadow-md bg-white"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    );
  }
  return (
    <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-200 shadow-md">
      <UserIcon className="h-12 w-12 text-gray-400" aria-hidden="true" />
    </div>
  );
}

export default function PitchersPage() {
  const { list, remove } = usePitchers();
  const [pitcherAEditar, setPitcherAEditar] = useState<Pitcher | null>(null);

  // Manejo de Carga (sin cambios)
  if (list.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#90D1F2] to-[#012F8A]">
        <p className="text-2xl font-bold text-white">Cargando pitchers...</p>
      </div>
    );
  }

  // Manejo de Error (sin cambios)
  if (list.isError) {
    return <p>Error: {(list.error as Error).message}</p>;
  }

  const pitchers = list.data ?? [];

  // --- CAMBIO 2: Lógica de Agrupación ---
  // Usamos useMemo para agrupar los pitchers por equipo de forma eficiente
  const pitchersPorEquipo = useMemo(() => {
    // Si no hay pitchers, devuelve un objeto vacío
    if (!pitchers) return {};

    // Usamos 'reduce' para transformar el array [p1, p2, ...]
    // en un objeto agrupado: { "Equipo A": [p1], "Equipo B": [p2], "Sin equipo": [p3] }
    return pitchers.reduce(
      (acc, pitcher) => {
        // Obtenemos el nombre del equipo. Si no tiene, lo mandamos a "Sin equipo"
        const equipoKey = pitcher.equipo?.nombre ?? "Sin equipo";

        // Si la "llave" (nombre del equipo) no existe en el objeto, la creamos como un array vacío
        if (!acc[equipoKey]) {
          acc[equipoKey] = [];
        }

        // Agregamos el pitcher actual al array de su equipo
        acc[equipoKey].push(pitcher);

        return acc;
      },
      {} as Record<string, Pitcher[]> // Tipado para TypeScript
    );
  }, [pitchers]); // Esta función solo se re-ejecuta si el array 'pitchers' cambia

  return (
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 pb-10 font-sans sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        {/* Cabecera (sin cambios) */}
        <header className="flex items-center justify-between pb-8">
          <h1
            className="text-4xl font-bold text-white"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
          >
            Pitchers
          </h1>
          <NewPitcherModal />
        </header>

        {/* --- CAMBIO 3: Renderizado por Grupos --- */}
        {pitchers.length > 0 ? (
          // Contenedor principal para las *secciones* de cada equipo
          <div className="flex flex-col gap-10">
            
            {/* Iteramos sobre las "llaves" del objeto (los nombres de equipo) */}
            {Object.keys(pitchersPorEquipo).map((nombreEquipo) => (
              
              // Creamos una sección para cada equipo
              <section key={nombreEquipo}>
                
                {/* Título del Equipo */}
                <h2
                  className="mb-4 text-2xl font-bold capitalize text-white"
                  style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.2)" }}
                >
                  {nombreEquipo}
                </h2>

                {/* Grilla de Pitchers (Esta es tu grilla original, ahora *dentro* de la sección) */}
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  
                  {/* Iteramos solo sobre los pitchers que pertenecen a "este" equipo */}
                  {pitchersPorEquipo[nombreEquipo].map((p) => (
                    
                    // Tu componente de tarjeta (sin cambios)
                    <div
                      key={p.id}
                      className="group relative flex transform flex-col rounded-2xl bg-white p-6 text-center shadow-xl transition-transform duration-300 hover:-translate-y-2"
                    >
                      <Avatar
                        // src={p.fotoUrl ?? p.foto_url}
                        alt={`Foto de ${p.nombre} ${p.apellido}`}
                      />

                      <h2 className="text-2xl font-bold text-gray-800">
                        {p.nombre} {p.apellido}
                      </h2>
                      {/* Dejamos el nombre del equipo en la tarjeta por si acaso, aunque ya esté en el título */}
                      <p className="text-md text-gray-500">
                        {p.equipo?.nombre ?? "Sin equipo"}
                      </p>
                      <p className="mt-2 text-sm font-semibold text-gray-400">
                        #{p.numero_camiseta}
                      </p>

                      {/* Botones de hover (sin cambios) */}
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
                            if (
                              confirm(
                                `¿Seguro que quieres eliminar a ${p.nombre} ${p.apellido}?`
                              )
                            ) {
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
              </section>
            ))}
          </div>
        ) : (
          // Mensaje cuando no hay pitchers (sin cambios)
          <div className="flex h-64 items-center justify-center rounded-lg bg-white/20">
            <p className="text-xl text-white">
              No hay pitchers registrados todavía.
            </p>
          </div>
        )}

        {/* Modal de Edición (sin cambios) */}
        <EditPitcherModal
          pitcher={pitcherAEditar}
          onClose={() => setPitcherAEditar(null)}
        />
      </div>
    </main>
  );
}