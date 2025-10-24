// En: app/(private)/partidos/[id]/scout/page.tsx
'use client';

// (Importamos 'useState' que ya teníamos)
import React, { useState } from 'react';

// --- Tus importaciones ---
import StrikeZoneGrid from '@/app/components/StrikeZoneGrid';
import ScoutCounterCard from '@/app/(private)/partidos/ScoutCounterCard';
import ActivePitcherToggle from '@/app/(private)/partidos/ActivePitcherToggle';
import ScoutCountCard from '@/app/(private)/partidos/ScoutCountCard';

// --- NUEVO 1: IMPORTACIONES PARA EL MODAL ---
import Modal from '@/app/components/Modal'; 
import RegistrarLanzamientoForm, { 
  LanzamientoData 
} from '@/app/(private)/partidos/RegistrarLanzamientoForm';

type ActivePitcher = 'local' | 'visitante';

export default function ScoutPage({ params }: { params: { id: string } }) {
  
  // --- Estado del Pitcher (ya lo teníamos) ---
  const [activePitcher, setActivePitcher] = useState<ActivePitcher>('local');
  
  // --- NUEVO 2: ESTADOS PARA EL MODAL ---
  // 'isModalOpen' controla si el modal se ve o no.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 'selectedZone' guarda el número (0-24) de la zona clickeada.
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  // (Datos falsos)
  const fakeLocalPitcher = { nombre: 'Laura Fernández', equipo: 'Leones' };
  const fakeVisitantePitcher = { nombre: 'Juan Pérez', equipo: 'Tigres' };
  
  // --- NUEVO 3: MANEJADORES PARA EL MODAL Y FORMULARIO ---

  /**
   * Se llama desde StrikeZoneGrid cuando se hace clic en una zona.
   */
  const handleZoneClick = (zoneIndex: number) => {
    console.log(`Clic en zona ${zoneIndex}, abriendo modal...`);
    setSelectedZone(zoneIndex); // Guardamos qué zona se clickeó
    setIsModalOpen(true);     // Abrimos el modal
  };

  /**
   * Se llama desde el Modal (overlay) o el Formulario (cancelar).
   */
  const handleCloseModal = () => {
    setIsModalOpen(false); // Cerramos el modal
    setSelectedZone(null); // Limpiamos la zona seleccionada
  };

  /**
   * Se llama desde RegistrarLanzamientoForm cuando se guarda.
   */
  const handleFormSubmit = (data: LanzamientoData) => {
    console.log('--- ¡NUEVO LANZAMIENTO REGISTRADO! ---');
    console.log('Datos del Formulario:', data);
    console.log('Pitcher Activo:', activePitcher);
    console.log('Zona Seleccionada:', selectedZone);
    
    // --- LÓGICA FUTURA ---
    // Aquí es donde guardaremos 'data', 'activePitcher' y 'selectedZone'
    // en nuestros 'arrays' de estado (cajaDeLanzamientosLocal, etc.)
    // Y también actualizaremos la cuenta (Bolas/Strikes/Outs)

    handleCloseModal(); // Cerramos el modal después de guardar
  };

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
              footerText="Lanzando: Tigres"
            />
            <ScoutCountCard />
            <ScoutCounterCard title="Outs" initialValue={0} />
          </section>

          {/* --- PITCHER ACTIVO --- */}
          <ActivePitcherToggle 
            active={activePitcher}
            onToggle={setActivePitcher}
            localPitcher={fakeLocalPitcher}
            visitantePitcher={fakeVisitantePitcher}
          />

          {/* --- ZONA DE STRIKE --- */}
          <section className="flex flex-col items-center mt-6">
            {/* --- NUEVO 4: PASAMOS LA PROP 'onZoneClick' --- */}
            <StrikeZoneGrid onZoneClick={handleZoneClick} />
          </section>

        </div>
        
        {/* --- NUEVO 5: EL MODAL (fuera de la tarjeta blanca) --- */}
        {/* Estará invisible hasta que 'isModalOpen' sea 'true'.
          Le pasamos las funciones para controlarlo.
        */}
        <Modal
          open={isModalOpen}
          onClose={handleCloseModal}
          title="Detalles del Lanzamiento"
        >
          <RegistrarLanzamientoForm
            onSubmit={handleFormSubmit}
            onCancel={handleCloseModal}
          />
        </Modal>

      </div>
    </main>
  );
}