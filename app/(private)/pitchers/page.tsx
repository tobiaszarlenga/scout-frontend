// app/(private)/pitchers/page.tsx
"use client";

import { useState } from "react";
import { usePitchers } from "@/hooks/usePitchers";
import type { Pitcher } from "@/lib/api";
import NewPitcherModal from "./NewPitcherModal";
import EditPitcherModal from "./EditPitcherModal";

// (Opcional) Puedes agregar íconos para los botones para un look más limpio
import { PencilIcon, TrashIcon } from '@heroicons/react/24/solid';

export default function PitchersPage() {
  const { list, remove } = usePitchers();
  const [pitcherAEditar, setPitcherAEditar] = useState<Pitcher | null>(null);

  if (list.isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#D2B48C] to-[#8B4513]">
        <p className="text-2xl font-bold text-white">Cargando pitchers...</p>
      </div>
    );
  }

  if (list.isError) {
    return <p>Error: {(list.error as Error).message}</p>;
  }

  const pitchers = list.data ?? [];

  return (
    // 1. Contenedor principal con el fondo de gradiente y padding
    <main className="min-h-screen w-full bg-gradient-to-br from-[#D2B48C] to-[#8B4513] p-6 sm:p-10 font-sans">
      
      {/* 2. Encabezado con nuevos estilos */}
      <header className="flex items-center justify-between pb-8">
        <h1 className="text-4xl font-bold text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
          Pitchers
        </h1>
        {/* Este es tu componente modal, el botón que lo abre está dentro de él */}
        <NewPitcherModal />
      </header>

      {/* 3. La nueva cuadrícula (grid) para las tarjetas */}
      {pitchers.length > 0 ? (
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          
          {/* 4. Mapeamos los pitchers para crear cada tarjeta */}
          {pitchers.map((p) => (
            <div 
              key={p.id} 
              className="group relative flex transform flex-col rounded-2xl bg-white p-6 text-center shadow-xl transition-transform duration-300 hover:-translate-y-2"
            >
              <div className="mx-auto mb-4 h-24 w-24 rounded-full border-4 border-white bg-gray-200 shadow-md">
                {/* Aquí podrías poner una <img /> si tuvieras la URL de la foto */}
              </div>

              <h2 className="text-2xl font-bold text-gray-800">{p.nombre} {p.apellido}</h2>
              <p className="text-md text-gray-500">{p.equipo?.nombre ?? "Sin equipo"}</p>
              <p className="mt-2 text-sm font-semibold text-gray-400">#{p.numero_camiseta}</p>

              {/* 5. Botones de acción con la misma lógica que tenías */}
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
        // Mensaje para cuando no hay pitchers
        <div className="flex h-64 items-center justify-center rounded-lg bg-white/20">
          <p className="text-xl text-white">No hay pitchers registrados todavía.</p>
        </div>
      )}

      {/* Tu componente modal de edición sigue funcionando igual */}
      <EditPitcherModal
        pitcher={pitcherAEditar}
        onClose={() => setPitcherAEditar(null)}
      />
    </main>
  );
}