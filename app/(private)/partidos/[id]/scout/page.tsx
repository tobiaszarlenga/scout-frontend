// En: app/(private)/partidos/[id]/scout/page.tsx
'use client';

// --- CAMBIO 1: Importamos 'useState' ---
import React, { useState } from 'react';

// (El resto de tus importaciones)
import StrikeZoneGrid from '@/app/components/StrikeZoneGrid';
import ScoutCounterCard from '@/app/(private)/partidos/ScoutCounterCard';
import ActivePitcherToggle from '@/app/(private)/partidos/ActivePitcherToggle';
import ScoutCountCard from '@/app/(private)/partidos/ScoutCountCard';

// --- CAMBIO 2: Definimos el tipo (buena práctica) ---
type ActivePitcher = 'local' | 'visitante';

export default function ScoutPage({ params }: { params: { id: string } }) {
  // 'params.id' tiene el ID del partido

  // --- CAMBIO 3: ¡El 'cerebro' está aquí! ---
  // Este es el estado que 'levantamos' del componente hijo.
  const [activePitcher, setActivePitcher] = useState<ActivePitcher>('local');
  
  // (Estos datos vendrán del 'partido' que carguemos con 'params.id' más adelante)
  const fakeLocalPitcher = { nombre: 'Laura Fernández', equipo: 'Leones' };
  const fakeVisitantePitcher = { nombre: 'Juan Pérez', equipo: 'Tigres' };

  // --- PRUEBA DE FUNCIONAMIENTO ---
  // Abre la consola de tu navegador (F12) y mira cómo cambia esto
  // cuando haces clic en el toggle.
  console.log('El pitcher activo (visto desde la página) es:', activePitcher);

  return (
    <main className="min-h-full w-full max-w-full overflow-x-hidden bg-gradient-to-br from-[#90D1F2] to-[#012F8A] px-6 py-6 sm:px-10 sm:py-8">
      <div className="mx-auto w-full max-w-6xl">
        
        {/* ... (Tu cabecera no cambia) ... */}
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

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-xl">
          
          {/* ... (Tu marcador no cambia) ... */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ScoutCounterCard
              title="Inning"
              initialValue={1}
              footerText="Lanzando: Tigres"
            />
            <ScoutCountCard />
            <ScoutCounterCard title="Outs" initialValue={0} />
          </section>

          {/* --- PITCHER ACTIVO (CAMBIO 4: Pasamos las props) --- */}
          <ActivePitcherToggle 
            active={activePitcher}
            onToggle={setActivePitcher}
            localPitcher={fakeLocalPitcher}
            visitantePitcher={fakeVisitantePitcher}
          />

          {/* --- ZONA DE STRIKE --- */}
          <section className="flex flex-col items-center mt-6">
            <StrikeZoneGrid />
          </section>

        </div>
      </div>
    </main>
  );
}