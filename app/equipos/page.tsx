"use client";

import { useEquipos } from "src/hooks/useEquipos";
import NewEquipoModal from "./NewEquipoModal";

export default function EquiposPage() {
  const { list, remove } = useEquipos();
  if (list.isLoading) return <p>Cargando...</p>;
  if (list.isError) return <p>Error: {(list.error as Error).message}</p>;

  const equipos = list.data ?? [];

  return (
    <main className="space-y-6">
      {/* HEADER con botón fuera de la tabla */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Equipos</h1>
        <NewEquipoModal />
      </div>

      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-2 border">ID</th>
            <th className="px-2 py-2 border">Nombre</th>
            <th className="px-2 py-2 border">Ciudad</th>
            <th className="px-2 py-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((e) => (
            <tr key={e.id}>
              <td className="px-2 py-1 border">{e.id}</td>
              <td className="px-2 py-1 border">{e.nombre}</td>
              <td className="px-2 py-1 border">{e.ciudad ?? "—"}</td>
              <td className="px-2 py-1 border">
                <button
                  className="rounded bg-red-600 px-2 py-1 text-white"
                  onClick={() => remove.mutate(e.id)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}

          {equipos.length === 0 && (
            <tr>
              <td className="px-2 py-4 text-center" colSpan={4}>
                Sin equipos
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
