// app/(private)/equipos/page.tsx
"use client";

import { useState } from "react";
import { useEquipos } from "hooks/useEquipos";
import NewEquipoModal from "./NewEquipoModal";
import EditEquipoModal from "@/app/(private)/equipos/EditEquipoModal";
import type { Equipo } from "@/types/equipo";
import { toast } from 'react-hot-toast'; // <-- Asegúrate de que esté importado
import { PencilIcon, TrashIcon, UsersIcon } from '@heroicons/react/24/solid';

export default function EquiposPage() {
  const { list, remove, update } = useEquipos();
  const [equipoAEditar, setEquipoAEditar] = useState<Equipo | null>(null);

  const handleOpenEditModal = (equipo: Equipo) => setEquipoAEditar(equipo);
  const handleCloseEditModal = () => setEquipoAEditar(null);

  // 👇 ESTA ES LA FUNCIÓN CLAVE CON LA NOTIFICACIÓN 'TOAST' 👇
  const handleSaveEquipo = async (values: Equipo) => {
    const dataToUpdate = {
      nombre: values.nombre,
      ciudad: values.ciudad,
    };

    await toast.promise(
      update.mutateAsync({ id: values.id, data: dataToUpdate }),
      {
        loading: 'Actualizando equipo...',
        success: `Equipo "${values.nombre}" actualizado con éxito.`,
        error: 'No se pudo actualizar el equipo.',
      }
    );

    handleCloseEditModal();
  };

  if (list.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#90D1F2] to-[#012F8A]">
        <p className="text-2xl font-bold text-white">Cargando equipos...</p>
      </div>
    );
  }
  if (list.isError) return <p>Error: {(list.error as Error).message}</p>;

  const equipos = list.data ?? [];

  return (
    // Importante: evitar w-screen para no empujar más allá del layout. Usamos w-full y control de overflow.
  <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 font-sans sm:px-10 sm:py-8">
      {/* Contenedor centrado que limita el ancho de contenido para prevenir desbordes */}
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between pb-8">
          <h1 className="text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
            Equipos
          </h1>
          <NewEquipoModal />
        </header>

        {/* Si en el futuro volvés a tabla, envolvé con overflow-x-auto para scroll horizontal solo en el contenido */}
        <div className="rounded-xl bg-white/90 p-2 shadow-xl backdrop-blur-sm">
          <div className="space-y-2">
          {equipos.map((e) => (
            <div 
              key={e.id} 
              className="group flex items-center rounded-lg p-3 transition-colors hover:bg-white/80"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                <UsersIcon className="h-6 w-6 text-gray-500" />
              </div>
              <div className="ml-4 flex-grow">
                <div className="font-bold text-gray-800">{e.nombre}</div>
                <div className="text-sm text-gray-500">{e.ciudad || 'Sin ciudad'}</div>
              </div>
              <div className="mr-4 text-center">
                <div className="font-bold text-gray-800">{e._count?.pitchers ?? 0}</div>
                <div className="text-sm text-gray-500">Pitchers</div>
              </div>
              <div className="flex items-center space-x-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  onClick={() => handleOpenEditModal(e)}
                  className="rounded-full bg-sky-600 p-2 text-white shadow-md hover:bg-sky-700"
                  title="Editar"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  className="rounded-full bg-red-600 p-2 text-white shadow-md hover:bg-red-700"
                  title="Borrar"
                  onClick={() => {
                    if (confirm(`¿Seguro que quieres eliminar al equipo ${e.nombre}?`)) {
                      remove.mutate(e.id);
                    }
                  }}
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))}
          </div>
          
          {equipos.length === 0 && (
            <div className="p-10 text-center text-gray-500">
              <p>No hay equipos registrados. ¡Crea el primero!</p>
            </div>
          )}
        </div>

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