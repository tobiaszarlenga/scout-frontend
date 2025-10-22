// En: app/(private)/partidos/[id]/scout.tsx
'use client';

import React from 'react';

// Esta es la página principal de scouting para un partido específico.
export default function ScoutPage({ params }: { params: { id: string } }) {
  // 'params.id' contendrá el ID del partido.
  // Lo usaremos más adelante para cargar los datos del partido.

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* --- 1. BARRA SUPERIOR --- */}
      <header className="flex justify-between items-center mb-6">
        <button className="text-gray-600 hover:text-gray-900">
          &larr; Volver
        </button>
        {/* Más adelante, este título será dinámico */}
        <h1 className="text-xl md:text-2xl font-bold">Leones vs Tigres</h1>
        <button className="bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600 transition-colors">
          Finalizar Partido
        </button>
      </header>

      {/* --- 2. MARCADOR (INNING, CUENTA, OUTS) --- */}
      {/* Usamos un grid para las 3 tarjetas */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* TODO: Crear el componente <InningCard /> */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          Tarjeta de Inning...
        </div>

        {/* TODO: Crear el componente <CountCard /> */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          Tarjeta de Cuenta...
        </div>

        {/* TODO: Crear el componente <OutsCard /> */}
        <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
          Tarjeta de Outs...
        </div>
      </section>
    

      {/* --- 3. PITCHER ACTIVO --- */}
      <section className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
        {/* TODO: Crear el componente <ActivePitcher /> */}
        Sección de Pitcher Activo...
      </section>

      {/* --- 4. ZONA DE STRIKE --- */}
      <section className="flex flex-col items-center">
        {/* TODO: Crear el componente <StrikeZoneGrid /> */}
        <div className="bg-gray-100 p-4 rounded-lg shadow-inner">
          Aquí irá la Zona de Strike 5x5...
        </div>
      </section>
    </div>
  );
}