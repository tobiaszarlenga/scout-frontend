// scout-frontend/app/(private)/partidos/page.tsx
'use client';

import React from 'react';
// Importamos los componentes
import PartidosProgramados from './PartidosProgramados';
import PartidosFinalizados from './PartidosFinalizados';
import NewPartidoModal from './NewPartidoModal';
// --- ¡CAMBIO 1: Importamos el hook! ---
import { usePartidos } from 'hooks/usePartidos';
// (Ya no necesitamos importar PartidoConDetalles aquí,
// porque el hook 'usePartidos' ya sabe qué tipo de datos devuelve)

// --- ¡CAMBIO 2: Borramos TODOS los 'mockPartidos...'! ---


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function PartidosPage() {
  
  // --- ¡CAMBIO 3: Usamos el hook! ---
  const { list } = usePartidos();

  // --- ¡CAMBIO 4: Filtramos los datos REALES de la API! ---
  // Usamos 'list.data?' (opcional) por si aún no ha cargado,
  // y '?? []' para que sea un array vacío por defecto.
  const programados =
    list.data?.filter((p) => p.estado === 'PROGRAMADO') ?? [];
  const finalizados =
    list.data?.filter((p) => p.estado === 'FINALIZADO') ?? [];

  return (
    // 1. Tu layout principal (sin cambios)
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        
        {/* 2. Tu cabecera (sin cambios) */}
        <header className="flex items-center justify-between pb-8">
          <div>
            <h1
              className="text-4xl font-bold text-white"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
            >
              Partidos
            </h1>
            <p className="text-gray-200">
              Gestiona y monitorea los partidos de softball
            </p>
          </div>
          <NewPartidoModal />
        </header>

        {/* 4. Las listas de partidos (¡AHORA CON DATOS REALES!) */}
        <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Partidos Programados</h2>
          
          {/* --- ¡CAMBIO 5: Manejamos los estados de carga! --- */}
          {list.isPending && (
            <p className="text-gray-500">Cargando partidos...</p>
          )}
          {list.isError && (
            <p className="text-red-600">
              Error al cargar partidos: {list.error.message}
            </p>
          )}
          {/* Si ya cargó (isSuccess), pasamos los datos filtrados */}
          {/* Tu componente 'PartidosProgramados' ya maneja el 'programados.length === 0' */}
          {list.isSuccess && (
            <PartidosProgramados partidos={programados} />
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Partidos Finalizados</h2>
          
          {/* --- ¡CAMBIO 6: Repetimos el manejo de estados! --- */}
          {list.isPending && (
            <p className="text-gray-500">Cargando partidos...</p>
          )}
          {list.isError && (
            <p className="text-red-600">
              Error al cargar partidos: {list.error.message}
            </p>
          )}
          {list.isSuccess && (
            <PartidosFinalizados partidos={finalizados} />
          )}
        </div>
        
      </div>
    </main>
  );
}