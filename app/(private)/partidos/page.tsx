// En /app/(private)/partidos/page.tsx
'use client';

import React, { useState } from 'react';
// Importamos los tipos
import type { Equipo } from '@/types/equipo';
import type { Pitcher } from '@/types/pitcher';
import type { Partido } from '@/types/partido'; // Importamos el tipo base

// --- COMPONENTES (desde la misma carpeta) ---
import PartidosProgramados from './PartidosProgramados';
import PartidosFinalizados from './PartidosFinalizados';
// CAMBIO: Importamos el nuevo componente "inteligente"
import NewPartidoModal from './NewPartidoModal'; 

// --- Tipos y Datos de Ejemplo (Mock Data) ---
// Creamos el tipo 'PartidoConDetalles' extendiendo el 'Partido' base
export type PartidoConDetalles = Partido & {
  equipoLocal: Pick<Equipo, 'nombre'>;
  equipoVisitante: Pick<Equipo, 'nombre'>;
  pitcherLocal: Pick<Pitcher, 'nombre' | 'apellido'>;
  pitcherVisitante: Pick<Pitcher, 'nombre' | 'apellido'>;
};

// Nuestros datos de ejemplo
const mockPartidos: PartidoConDetalles[] = [
  // ... (los datos de ejemplo quedan igual) ...
  {
    id: 1,
    fecha: new Date('2025-10-17T22:57:00'),
    horario: '22:57',
    campo: 'dsfsd',
    estado: 'PROGRAMADO',
    equipoLocalId: 1,
    equipoVisitanteId: 2,
    pitcherLocalId: 1,
    pitcherVisitanteId: 2,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    equipoLocal: { nombre: 'Tigres' },
    equipoVisitante: { nombre: 'Tigres' },
    pitcherLocal: { nombre: 'Juan', apellido: 'Pérez' },
    pitcherVisitante: { nombre: 'Ana', apellido: 'Martínez' },
  },
  {
    id: 2,
    fecha: new Date('2025-10-17T19:00:00'),
    horario: '19:00',
    campo: 'cef',
    estado: 'FINALIZADO',
    equipoLocalId: 1,
    equipoVisitanteId: 2,
    pitcherLocalId: 1,
    pitcherVisitanteId: 2,
    creadoEn: new Date(),
    actualizadoEn: new Date(),
    equipoLocal: { nombre: 'Tigres' },
    equipoVisitante: { nombre: 'Tigres' },
    pitcherLocal: { nombre: 'Juan', apellido: 'Pérez' },
    pitcherVisitante: { nombre: 'Ana', apellido: 'Martínez' },
  },
];

// --- COMPONENTE PRINCIPAL DE LA PÁGINA ---
export default function PartidosPage() {
  // El 'useState' para los partidos se queda
  const [partidos, setPartidos] = useState<PartidoConDetalles[]>(mockPartidos);

  // BORRAMOS: const [isModalOpen, setIsModalOpen] = useState(false);
  // BORRAMOS: const handleCrearPartido = (...)

  const programados = partidos.filter((p) => p.estado === 'PROGRAMADO');
  const finalizados = partidos.filter((p) => p.estado === 'FINALIZADO');

  return (
    // 1. Tu layout principal con el fondo azul
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        
        {/* 2. Tu cabecera */}
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
          
          {/* 3. CAMBIO CLAVE: Reemplazamos el botón por el componente modal */}
          <NewPartidoModal />
          
        </header>

        {/* 4. Las listas de partidos (esto queda igual) */}
        <div className="bg-white p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Partidos Programados</h2>
          <PartidosProgramados partidos={programados} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Partidos Finalizados</h2>
          <PartidosFinalizados partidos={finalizados} />
        </div>

        {/* 5. BORRAMOS: El <NuevoPartidoModal ... /> de aquí */}
        
      </div>
    </main>
  );
}