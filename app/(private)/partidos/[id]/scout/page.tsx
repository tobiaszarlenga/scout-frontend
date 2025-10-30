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

// --- NUEVO: Importamos el hook de lookups ---
import { useLookups } from '@/hooks/useLookups';

// --- CAMBIO 1: Importamos el nuevo componente ---
import PitcherCard from './PitcherCard';

type ActivePitcher = 'local' | 'visitante';

// --- NUEVO: Tipo para los lanzamientos guardados ---
interface LanzamientoGuardado extends LanzamientoData {
  zona: number; // Índice de la zona de strike (0-24)
  pitcher: ActivePitcher; // Quién lanzó ('local' o 'visitante')
  timestamp: Date; // Cuándo se registró
  inning: number; // En qué inning se registró
  ladoInning: 'abre' | 'cierra'; // Si fue abriendo o cerrando el inning
}

export default function ScoutPage({ params }: { params: { id: string } }) {
  
  // --- NUEVO: Cargamos los lookups (tipos y resultados) ---
  const { tipos, resultados } = useLookups();

  // --- Estado del Pitcher (ya lo teníamos) ---
  const [activePitcher, setActivePitcher] = useState<ActivePitcher>('local');
  
  // --- Estados para el contador de cuenta (Bolas y Strikes) ---
  const [inning, setInning] = useState(1);
  const [bolas, setBolas] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [outs, setOuts] = useState(0);
  
  // Estado para controlar qué lado del inning estamos
  // 'abre' = Local lanza (primeros 3 outs)
  // 'cierra' = Visitante lanza (últimos 3 outs)
  const [ladoInning, setLadoInning] = useState<'abre' | 'cierra'>('abre');
  
  // --- NUEVO 2: ESTADOS PARA EL MODAL ---
  // 'isModalOpen' controla si el modal se ve o no.
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 'selectedZone' guarda el número (0-24) de la zona clickeada.
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  // --- NUEVO 3: LA "CAJA" DONDE GUARDAMOS TODOS LOS LANZAMIENTOS ---
  // Este array irá creciendo cada vez que se registre un lanzamiento
  const [lanzamientos, setLanzamientos] = useState<LanzamientoGuardado[]>([]);

  // (Datos falsos)
  const fakeLocalPitcher = { nombre: 'Laura Fernández', equipo: 'Leones' };
  const fakeVisitantePitcher = { nombre: 'Juan Pérez', equipo: 'Tigres' };
  
  // --- Filtrar lanzamientos del pitcher activo ---
  const lanzamientosDelPitcherActivo = lanzamientos.filter(l => l.pitcher === activePitcher);
  const ultimoLanzamiento = lanzamientosDelPitcherActivo.length > 0 
    ? lanzamientosDelPitcherActivo[lanzamientosDelPitcherActivo.length - 1] 
    : null;
  
  // --- Helper para obtener rango de innings de un pitcher ---
  const getInningsRange = (pitcherType: ActivePitcher): string => {
    const lanzamientosPitcher = lanzamientos.filter(l => l.pitcher === pitcherType);
    if (lanzamientosPitcher.length === 0) return '-';
    
    const innings = lanzamientosPitcher.map(l => l.inning);
    const min = Math.min(...innings);
    const max = Math.max(...innings);
    
    return min === max ? `${min}` : `${min}-${max}`;
  };
  
  // --- FUNCIONES HELPER PARA CONVERTIR IDs A NOMBRES ---
  const getTipoNombre = (tipoId: number | null): string => {
    if (!tipoId || !tipos.data) return '-';
    const tipo = tipos.data.find((t) => t.id === tipoId);
    return tipo ? tipo.nombre : `ID ${tipoId}`;
  };

  const getResultadoNombre = (resultadoId: number | null): string => {
    if (!resultadoId || !resultados.data) return '-';
    const resultado = resultados.data.find((r) => r.id === resultadoId);
    return resultado ? resultado.nombre : `ID ${resultadoId}`;
  };
  
  // --- FUNCIÓN PARA REINICIAR LA CUENTA ---
  const resetCuenta = () => {
    setBolas(0);
    setStrikes(0);
  };
  
  // --- FUNCIÓN PARA MANEJAR CAMBIOS EN EL INNING ---
  const handleInningChange = (nuevoInning: number) => {
    setInning(nuevoInning);
    // Cuando cambia el inning manualmente, resetear todo y volver a 'abre'
    setOuts(0);
    setLadoInning('abre');
    setActivePitcher('local'); // Local abre el inning
    resetCuenta();
    console.log(`⚾ Cambio al Inning ${nuevoInning} - Reseteo completo, Local abre`);
  };
  
  // --- FUNCIÓN PARA MANEJAR 3 OUTS (CAMBIO DE LADO O INNING) ---
  const handleTresOuts = () => {
    if (ladoInning === 'abre') {
      // Local terminó de lanzar (abrió el inning), ahora cierra el visitante
      console.log('⚾⚾⚾ 3 OUTS - El visitante ahora CIERRA el inning');
      setLadoInning('cierra');
      setActivePitcher('visitante');
      setOuts(0);
      resetCuenta();
    } else {
      // Visitante terminó de lanzar (cerró el inning), cambio de inning completo
      console.log('⚾⚾⚾ 3 OUTS - ¡FIN DEL INNING! Pasando al siguiente...');
      setInning((prev) => prev + 1);
      setLadoInning('abre'); // El nuevo inning lo abre el local
      setActivePitcher('local');
      setOuts(0);
      resetCuenta();
    }
  };
  
  // --- FUNCIÓN PARA PROCESAR LA LÓGICA DEL BÉISBOL ---
  const procesarResultado = (resultadoId: number | null) => {
    if (!resultadoId || !resultados.data) return;
    
    const resultado = resultados.data.find((r) => r.id === resultadoId);
    if (!resultado) return;
    
    const nombreResultado = resultado.nombre.toUpperCase();
    
    switch (nombreResultado) {
      case 'STRIKE':
        // Agregar un strike
        if (strikes + 1 >= 3) {
          // 3 strikes = OUT
          const nuevosOuts = outs + 1;
          if (nuevosOuts >= 3) {
            // 3 outs = CAMBIO DE LADO O INNING
            console.log('⚾ 3 STRIKES - OUT!');
            handleTresOuts();
          } else {
            setOuts(nuevosOuts);
            resetCuenta();
            console.log(`⚾ 3 STRIKES - OUT! (${nuevosOuts}/3 outs)`);
          }
        } else {
          setStrikes((prev) => prev + 1);
          console.log(`⚾ Strike #${strikes + 1}`);
        }
        break;
        
      case 'BOLA':
        // Agregar una bola
        if (bolas + 1 >= 4) {
          // 4 bolas = BASE POR BOLAS
          resetCuenta();
          console.log('⚾ 4 BOLAS - BASE POR BOLAS!');
        } else {
          setBolas((prev) => prev + 1);
          console.log(`⚾ Bola #${bolas + 1}`);
        }
        break;
        
      case 'FOUL':
        // Foul cuenta como strike, pero no puede hacer el tercer strike
        if (strikes < 2) {
          setStrikes((prev) => prev + 1);
          console.log(`⚾ Foul - Strike #${strikes + 1}`);
        } else {
          console.log('⚾ Foul - Strike se mantiene en 2');
        }
        break;
        
      case 'HIT':
        // Hit = reiniciar la cuenta
        resetCuenta();
        console.log('⚾ HIT - Cuenta reiniciada');
        break;
        
      case 'OUT':
        // Out directo (ej: out jugado)
        const nuevosOuts = outs + 1;
        if (nuevosOuts >= 3) {
          // 3 outs = CAMBIO DE LADO O INNING
          console.log('⚾ OUT!');
          handleTresOuts();
        } else {
          setOuts(nuevosOuts);
          resetCuenta();
          console.log(`⚾ OUT! (${nuevosOuts}/3 outs)`);
        }
        break;
        
      default:
        console.log(`⚾ Resultado no reconocido: ${nombreResultado}`);
    }
  };
  
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
    
    // --- PROCESAR LA LÓGICA DEL BÉISBOL ---
    procesarResultado(data.resultadoId);
    
    // --- GUARDAR EN LA "CAJA" (ARRAY) ---
    // Creamos un objeto completo con TODOS los datos del lanzamiento
    const nuevoLanzamiento: LanzamientoGuardado = {
      ...data, // tipo, resultado, velocidad, comentario
      zona: selectedZone ?? 0, // La zona donde se clickeó
      pitcher: activePitcher, // Quién lanzó (local o visitante)
      timestamp: new Date(), // Cuándo se registró
      inning: inning, // En qué inning
      ladoInning: ladoInning, // Si estaba abriendo o cerrando
    };

    // Agregamos el nuevo lanzamiento al array
    // (Usamos la función de actualización para garantizar que tengamos el estado más reciente)
    setLanzamientos((prevLanzamientos) => [...prevLanzamientos, nuevoLanzamiento]);

    console.log('✅ Lanzamiento guardado en el array:', nuevoLanzamiento);

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
              value={inning}
              onChange={handleInningChange}
              footerText={
                ladoInning === 'abre' 
                  ? `${fakeLocalPitcher.equipo} abre` 
                  : `${fakeVisitantePitcher.equipo} cierra`
              }
            />
            <ScoutCountCard 
              bolas={bolas} 
              strikes={strikes} 
              onReset={resetCuenta}
            />
            <ScoutCounterCard 
              title="Outs" 
              value={outs}
              readOnly={true}
            />
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
            {/* Contador de lanzamientos registrados del pitcher activo */}
            <div className="mb-4 text-center">
              <p className="text-lg font-semibold text-gray-700">
                Lanzamientos Registrados ({activePitcher === 'local' ? fakeLocalPitcher.nombre : fakeVisitantePitcher.nombre}): 
                <span className="ml-2 text-2xl text-blue-600 font-bold">
                  {lanzamientosDelPitcherActivo.length}
                </span>
              </p>
              {ultimoLanzamiento && (
                <p className="text-sm text-gray-500 mt-1">
                  Último: {getTipoNombre(ultimoLanzamiento.tipoId)} - 
                  {getResultadoNombre(ultimoLanzamiento.resultadoId)} - 
                  Zona {ultimoLanzamiento.zona}
                </p>
              )}
            </div>

            {/* --- NUEVO 4: PASAMOS LA PROP 'onZoneClick' --- */}
            <StrikeZoneGrid onZoneClick={handleZoneClick} />
          </section>

          {/* --- CARDS DE PITCHERS --- */}
          {lanzamientos.length > 0 && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Historial de Lanzamientos por Pitcher
              </h2>
              
              {/* Grid de 2 columnas para las cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* COLUMNA IZQUIERDA: PITCHERS LOCALES */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center uppercase tracking-wide">
                    {fakeLocalPitcher.equipo}
                  </h3>
                  <div className="space-y-3">
                    {/* Por ahora solo un pitcher, luego agregaremos relevos */}
                    <PitcherCard
                      nombre={fakeLocalPitcher.nombre}
                      equipo={fakeLocalPitcher.equipo}
                      cantidadLanzamientos={lanzamientos.filter(l => l.pitcher === 'local').length}
                      innings={getInningsRange('local')}
                      onClick={() => {
                        // TODO: Navegar a página de detalle
                        console.log('Click en pitcher local');
                      }}
                      tipo="local"
                    />
                  </div>
                </div>

                {/* COLUMNA DERECHA: PITCHERS VISITANTES */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center uppercase tracking-wide">
                    {fakeVisitantePitcher.equipo}
                  </h3>
                  <div className="space-y-3">
                    {/* Por ahora solo un pitcher, luego agregaremos relevos */}
                    <PitcherCard
                      nombre={fakeVisitantePitcher.nombre}
                      equipo={fakeVisitantePitcher.equipo}
                      cantidadLanzamientos={lanzamientos.filter(l => l.pitcher === 'visitante').length}
                      innings={getInningsRange('visitante')}
                      onClick={() => {
                        // TODO: Navegar a página de detalle
                        console.log('Click en pitcher visitante');
                      }}
                      tipo="visitante"
                    />
                  </div>
                </div>

              </div>
            </section>
          )}

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