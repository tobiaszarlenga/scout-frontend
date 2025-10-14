"use client";

import { useState } from "react";
import { useEquipos } from "src/hooks/useEquipos";
import NewEquipoModal from "./NewEquipoModal";
import EditEquipoModal from "./EditEquipoModal";
import type { Equipo } from "../../src/types/equipo";

export default function EquiposPage() {
  // 1. Obtenemos la función 'update' del hook
  const { list, remove, create, update } = useEquipos();
  const [equipoAEditar, setEquipoAEditar] = useState<Equipo | null>(null);

  if (list.isLoading) return <p>Cargando...</p>;
  if (list.isError) return <p>Error: {(list.error as Error).message}</p>;

  const equipos = list.data ?? [];

  const handleOpenEditModal = (equipo: Equipo) => {
    setEquipoAEditar(equipo);
  };

  const handleCloseEditModal = () => {
    setEquipoAEditar(null);
  };

  // 2. Modificamos la función para que llame a la API
  const handleSaveEquipo = async (values: Equipo) => {
    try {
      const dataToUpdate = {
        nombre: values.nombre,
        ciudad: values.ciudad,
      };
      // Llamamos a la mutación con el 'id' y los nuevos 'data'
      await update.mutateAsync({ id: values.id, data: dataToUpdate });
      
      // Opcional: Notificar al usuario que todo salió bien
      alert(`Equipo "${values.nombre}" actualizado correctamente`);

    } catch (error) {
      console.error("Error al actualizar el equipo:", error);
      alert("No se pudo actualizar el equipo. Revisa la consola para más detalles.");
    } finally {
      // Cerramos el modal, tanto si hubo éxito como si hubo error
      handleCloseEditModal();
    }
  };

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Equipos</h1>
        {/* Pasamos 'create' al NewEquipoModal si lo necesita,
            asumiendo que sigue tu estructura actual. */}
        <NewEquipoModal />
      </div>

      <table className="min-w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-2 py-2 border">Nombre</th>
            <th className="px-2 py-2 border">Ciudad</th>
            <th className="px-2 py-2 border text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {equipos.map((e) => (
            <tr key={e.id}>
              <td className="px-2 py-1 border">{e.nombre}</td>
              <td className="px-2 py-1 border">{e.ciudad ?? "—"}</td>
              <td className="px-2 py-1 border">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => handleOpenEditModal(e)}
                    className="rounded bg-blue-600 px-2 py-1 text-white"
                  >
                    Editar
                  </button>
                  <button
                    className="rounded bg-red-600 px-2 py-1 text-white"
                    onClick={() => remove.mutate(e.id)}
                  >
                    Borrar
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {equipos.length === 0 && (
            <tr>
              <td className="px-2 py-4 text-center" colSpan={3}>
                Sin equipos
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <EditEquipoModal
        open={equipoAEditar !== null}
        equipo={equipoAEditar}
        onClose={handleCloseEditModal}
        onSave={handleSaveEquipo}
      />
    </main>
  );
}                         