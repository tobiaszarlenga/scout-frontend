// scout-frontend/app/(private)/partidos/page.tsx
'use client';

import React from 'react';
import PartidosProgramados from './PartidosProgramados';
import PartidosFinalizados from './PartidosFinalizados';
import NewPartidoModal from './NewPartidoModal';
import { usePartidos } from 'hooks/usePartidos';

// 🎨 Paleta (coincide con el dashboard)
const COLORS = {
  bgFrom: '#1F2F40',
  bgTo:   '#15202B',
  card:   '#22313F',
  text:   '#DDE2E5',
  accent: '#E04E0E',
};

export default function PartidosPage() {
  const { list } = usePartidos();

  const programados = list.data?.filter((p) => p.estado === 'PROGRAMADO') ?? [];
  const finalizados = list.data?.filter((p) => p.estado === 'FINALIZADO') ?? [];

  return (
    <main
      className="min-h-full w-full max-w-full overflow-x-hidden px-6 py-6 sm:px-10 sm:py-8"
      style={{ background: `linear-gradient(150deg, ${COLORS.bgFrom}, ${COLORS.bgTo})` }}
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="flex items-center justify-between pb-8">
          <div>
            <h1
              className="text-4xl font-bold"
              style={{ color: COLORS.text, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
            >
              Partidos
            </h1>
            <p className="mt-1" style={{ color: '#AAB4BD' }}>
              Gestiona y monitorea los partidos de softball
            </p>
          </div>
          {/* El modal mantiene su propio estilo; si adentro hay botones, idealmente usar COLORS.accent */}
          <NewPartidoModal />
        </header>

        {/* Partidos Programados */}
        <div
          className="p-6 rounded-lg shadow-xl mb-8"
          style={{ backgroundColor: COLORS.card }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.text }}>
            Partidos Programados
          </h2>

          {list.isPending && <p style={{ color: '#AAB4BD' }}>Cargando partidos...</p>}

          {list.isError && (
            <p className="font-semibold" style={{ color: '#ff7b7b' }}>
              Error al cargar partidos: {list.error.message}
            </p>
          )}

          {list.isSuccess && <PartidosProgramados partidos={programados} />}
        </div>

        {/* Partidos Finalizados */}
        <div
          className="p-6 rounded-lg shadow-xl"
          style={{ backgroundColor: COLORS.card }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: COLORS.text }}>
            Partidos Finalizados
          </h2>

          {list.isPending && <p style={{ color: '#AAB4BD' }}>Cargando partidos...</p>}

          {list.isError && (
            <p className="font-semibold" style={{ color: '#ff7b7b' }}>
              Error al cargar partidos: {list.error.message}
            </p>
          )}

          {list.isSuccess && <PartidosFinalizados partidos={finalizados} />}
        </div>
      </div>
    </main>
  );
}
