// scout-frontend/app/(private)/partidos/page.tsx
'use client';

import React from 'react';
// Importamos los componentes desde la misma carpeta
import PartidosProgramados from './PartidosProgramados';
import PartidosFinalizados from './PartidosFinalizados';
import NewPartidoModal from './NewPartidoModal';
// Importamos el tipo unificado
import type { PartidoConDetalles } from 'types/partido';

// --- DATOS DE PRUEBA (MOCK DATA) ---
// (Usamos los datos corregidos con 'string' en las fechas)

const mockPartidosProgramados: PartidoConDetalles[] = [
  {
    id: 1,
    fecha: '2025-10-17T12:37:00.000Z',
    campo: 'dsfsd',
    estado: 'PROGRAMADO',
    equipoLocalId: 1,
    equipoVisitanteId: 2,
    pitcherLocalId: 1,
    pitcherVisitanteId: 2,
    autorId: 1,
    creadoEn: '2025-10-16T10:00:00.000Z',
    actualizadoEn: '2025-10-16T10:00:00.000Z',
    equipoLocal: { nombre: 'Tigres' },
    equipoVisitante: { nombre: 'Águilas' },
    pitcherLocal: { nombre: 'Juan', apellido: 'Pérez' },
    pitcherVisitante: { nombre: 'Ana', apellido: 'Martinez' },
  },
];

const mockPartidosFinalizados: PartidoConDetalles[] = [
  {
    id: 2,
    fecha: '2025-10-15T18:00:00.000Z',
    campo: 'cef',
    estado: 'FINALIZADO',
    equipoLocalId: 1,
    equipoVisitanteId: 2,
    pitcherLocalId: 1,
    pitcherVisitanteId: 2,
    autorId: 1,
    creadoEn: '2025-10-14T09:00:00.000Z',
    actualizadoEn: '2025-10-15T21:00:00.000Z',
    equipoLocal: { nombre: 'Tigres' },
    equipoVisitante: { nombre: 'Tigres' },
    pitcherLocal: { nombre: 'Juan', apellido: 'Pérez' },
    pitcherVisitante: { nombre: 'Ana', apellido: 'Martinez' },
  },
];
// --- FIN DE DATOS DE PRUEBA ---


// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function PartidosPage() {
  // Por ahora, usamos los datos de prueba.
  // ¡El próximo paso es reemplazar esto con usePartidos().list!
  const programados = mockPartidosProgramados;
  const finalizados = mockPartidosFinalizados;

  return (
    // 1. Tu layout principal con el fondo azul
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        
        {/* 2. Tu cabecera con estilos de texto blanco */}
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
          
          {/* 3. El componente modal en la cabecera */}
          <NewPartidoModal />
          
        </header>

        {/* 4. Las listas de partidos en tarjetas blancas */}
        <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Partidos Programados</h2>
          {/* ¡CORREGIDO! Usamos 'partidos={programados}' */}
          <PartidosProgramados partidos={programados} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Partidos Finalizados</h2>
          {/* ¡CORREGIDO! Usamos 'partidos={finalizados}' */}
          <PartidosFinalizados partidos={finalizados} />
        </div>
        
      </div>
    </main>
  );
}