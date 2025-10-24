// En: app/(private)/partidos/[id]/scout/page.tsx
'use client';

import React from 'react';

// --- 1. IMPORTACIONES ---
// ¡Ojo con las rutas! Asumiendo que tu alias '@/' apunta a la carpeta 'app/'
// (Si usaste rutas relativas antes, serían '../../...'. Usemos tus alias)

import StrikeZoneGrid from '@/app/components/StrikeZoneGrid';
import ScoutCounterCard from '@/app/(private)/partidos/ScoutCounterCard';
import ActivePitcherToggle from '@/app/(private)/partidos/ActivePitcherToggle';
import ScoutCountCard from '@/app/(private)/partidos/ScoutCountCard';

export default function ScoutPage({ params }: { params: { id: string } }) {
  // 'params.id' tiene el ID del partido

  return (
    // 1. Tu layout principal (fondo degradado)
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        
        {/* 2. Cabecera (Scouting en Vivo) */}
        <header className="flex items-center justify-between pb-8">
          <div>
            <button className="text-sm text-gray-200 hover:text-white">
              &larr; Volver a Partidos
            </button>
            <h1
              className="text-3xl md:text-4xl font-bold text-white"
              style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
            >
              Scouting en Vivo
            </h1>
          </div>
          <button className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-colors">
            Finalizar Partido
          </button>
        </header>

        {/* 3. TARJETA BLANCA DE CONTENIDO */}
        <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl">
          
          {/* --- MARCADOR (INNING, CUENTA, OUTS) --- */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ScoutCounterCard
              title="Inning"
              initialValue={1}
              footerText="Lanzando: Tigres" // (Temporal)
            />

            {/* --- 2. AQUÍ ESTÁ EL CAMBIO --- */}
            {/* Reemplazamos el <div> por nuestro nuevo componente */}
            <ScoutCountCard />

            <ScoutCounterCard title="Outs" initialValue={0} />
          </section>

          {/* --- PITCHER ACTIVO --- */}
     <ActivePitcherToggle />

          {/* --- ZONA DE STRIKE --- */}
          <section className="flex flex-col items-center mt-6">
            <StrikeZoneGrid />
          </section>

        </div>
      </div>
    </main>
  );
}