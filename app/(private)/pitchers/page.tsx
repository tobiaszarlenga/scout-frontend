// app/(private)/pitchers/page.tsx
"use client";

import { useState } from "react";
import { usePitchers } from "@/hooks/usePitchers";
import type { Pitcher } from "@/lib/api";
import NewPitcherModal from "./NewPitcherModal";
import EditPitcherModal from "./EditPitcherModal";

export default function PitchersPage() {
  const { list, remove } = usePitchers();
  const [pitcherAEditar, setPitcherAEditar] = useState<Pitcher | null>(null);

  if (list.isLoading) return <p>Cargando pitchers...</p>;
  if (list.isError) return <p>Error: {(list.error as Error).message}</p>;

  const pitchers = list.data ?? [];

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pitchers</h1>
        <NewPitcherModal />
      </div>

      <div className="overflow-x-auto rounded border">
        <table className="min-w-full ">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border text-left">Nombre</th>
              <th className="px-4 py-2 border text-left">Apellido</th>
              <th className="px-4 py-2 border text-left">Equipo</th>
              <th className="px-4 py-2 border text-center">Número de Camiseta</th>
              <th className="px-4 py-2 border text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pitchers.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">{p.nombre}</td>
                <td className="px-4 py-2 border">{p.apellido}</td>
                <td className="px-4 py-2 border">{p.equipo?.nombre ?? "Sin equipo"}</td>
                <td className="px-4 py-2 border text-center">{p.numero_camiseta}</td> {/* <-- 2. DATO AÑADIDO */}
                <td className="px-4 py-2 border">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => setPitcherAEditar(p)}
                      className="rounded bg-sky-600 px-3 py-1 text-white hover:bg-sky-700"
                    >
                      Editar
                    </button>
                    <button
                      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      onClick={() => {
                        if (confirm(`¿Seguro que quieres eliminar a ${p.nombre} ${p.apellido}?`)) {
                          remove.mutate(p.id);
                        }
                      }}
                    >
                      Borrar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {pitchers.length === 0 && (
              <tr>
                <td className="px-4 py-4 text-center text-gray-500" colSpan={5}> {/* Cambiado a 5 */}
                  No hay pitchers registrados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <EditPitcherModal
        pitcher={pitcherAEditar}
        onClose={() => setPitcherAEditar(null)}
      />
    </main>
  );
}