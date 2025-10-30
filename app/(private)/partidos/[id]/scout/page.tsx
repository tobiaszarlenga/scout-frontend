// En: app/(private)/partidos/[id]/scout/page.tsx
'use client';

// (Importamos 'useState' y 'useEffect' que necesitamos)
import React, { useState, useEffect } from 'react';

// --- Tus importaciones ---
import StrikeZoneGrid from '@/app/components/StrikeZoneGrid';
import ScoutCounterCard from '@/app/(private)/partidos/ScoutCounterCard';
import ActivePitcherToggle from '@/app/(private)/partidos/ActivePitcherToggle';
import ScoutCountCard from '@/app/(private)/partidos/ScoutCountCard';

// --- IMPORTACIONES PARA EL MODAL ---
import Modal from '@/app/components/Modal'; 
import RegistrarLanzamientoForm, { 
  LanzamientoData 
} from '@/app/(private)/partidos/RegistrarLanzamientoForm';

// --- Importamos los hooks ---
import { useLookups } from '@/hooks/useLookups';
import { usePartido } from '@/hooks/usePartidos';

// --- Importamos los componentes ---
import PitcherCard from './PitcherCard';
import CambiarPitcherModal from '@/app/(private)/partidos/CambiarPitcherModal';

type ActivePitcher = 'local' | 'visitante';

// --- NUEVO: Tipo para los lanzamientos guardados ---
interface LanzamientoGuardado extends LanzamientoData {
  zona: number; // Índice de la zona de strike (0-24)
  pitcher: ActivePitcher; // Quién lanzó ('local' o 'visitante')
  timestamp: Date; // Cuándo se registró
  inning: number; // En qué inning se registró
  ladoInning: 'abre' | 'cierra'; // Si fue abriendo o cerrando el inning
  pitcherId: string; // ID del pitcher que lanzó (para diferenciar relevos)
}

// --- NUEVO: Tipo para registrar pitchers que han lanzado ---
interface PitcherEnPartido {
  id: string; // ID temporal (luego será de la BD)
  nombre: string;
  equipo: string;
  tipo: ActivePitcher; // 'local' o 'visitante'
  entroEnInning: number; // En qué inning entró a lanzar
  salioEnInning?: number; // En qué inning salió (undefined si sigue activo)
}

export default function ScoutPage({ params }: { params: Promise<{ id: string }> }) {
  
  // --- Unwrap params (Next.js 15+) ---
  const { id } = React.use(params);
  
  // --- Cargar datos del partido desde la API ---
  const { data: partido, isLoading: loadingPartido } = usePartido(id);
  
  // --- Cargamos los lookups (tipos y resultados) ---
  const { tipos, resultados } = useLookups();

  // --- Estado del Pitcher (ya lo teníamos) ---
  const [activePitcher, setActivePitcher] = useState<ActivePitcher>('local');
  
  // --- Lista de pitchers que han lanzado en el partido ---
  const [pitchersEnPartido, setPitchersEnPartido] = useState<PitcherEnPartido[]>([]);
  
  // --- ID del pitcher actualmente lanzando (local y visitante) ---
  const [pitcherActivoLocalId, setPitcherActivoLocalId] = useState<string>('');
  const [pitcherActivoVisitanteId, setPitcherActivoVisitanteId] = useState<string>('');
  
  // --- Inicializar pitchers cuando carguen los datos del partido ---
  useEffect(() => {
    if (!partido) return;
    
    const pitcherLocalInicial: PitcherEnPartido = {
      id: String(partido.pitcherLocal.id),
      nombre: `${partido.pitcherLocal.nombre} ${partido.pitcherLocal.apellido}`,
      equipo: partido.equipoLocal.nombre,
      tipo: 'local',
      entroEnInning: 1,
    };
    
    const pitcherVisitanteInicial: PitcherEnPartido = {
      id: String(partido.pitcherVisitante.id),
      nombre: `${partido.pitcherVisitante.nombre} ${partido.pitcherVisitante.apellido}`,
      equipo: partido.equipoVisitante.nombre,
      tipo: 'visitante',
      entroEnInning: 1,
    };
    
    setPitchersEnPartido([pitcherLocalInicial, pitcherVisitanteInicial]);
    setPitcherActivoLocalId(String(partido.pitcherLocal.id));
    setPitcherActivoVisitanteId(String(partido.pitcherVisitante.id));
  }, [partido]);
  
  // --- Helper para obtener el pitcher activo actual ---
  const getPitcherActivo = (): PitcherEnPartido => {
    const id = activePitcher === 'local' ? pitcherActivoLocalId : pitcherActivoVisitanteId;
    return pitchersEnPartido.find(p => p.id === id)!;
  };
  
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
  
  // --- Estados para el modal de cambiar pitcher ---
  const [isModalCambiarPitcherOpen, setIsModalCambiarPitcherOpen] = useState(false);
  const [tipoPitcherACambiar, setTipoPitcherACambiar] = useState<ActivePitcher>('local');

  // (Datos falsos)
  const fakeLocalPitcher = { nombre: 'Laura Fernández', equipo: 'Leones' };
  const fakeVisitantePitcher = { nombre: 'Juan Pérez', equipo: 'Tigres' };
  
  // --- Obtener el pitcher activo actual de cada lado ---
  const pitcherLocalActivo = pitchersEnPartido.find(p => p.id === pitcherActivoLocalId);
  const pitcherVisitanteActivo = pitchersEnPartido.find(p => p.id === pitcherActivoVisitanteId);
  
  // --- Filtrar lanzamientos del pitcher activo ---
  const lanzamientosDelPitcherActivo = lanzamientos.filter(l => l.pitcher === activePitcher);
  const ultimoLanzamiento = lanzamientosDelPitcherActivo.length > 0 
    ? lanzamientosDelPitcherActivo[lanzamientosDelPitcherActivo.length - 1] 
    : null;
  
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
   * Abrir modal para cambiar pitcher
   */
  const handleAbrirModalCambiarPitcher = (tipo: ActivePitcher) => {
    setTipoPitcherACambiar(tipo);
    setIsModalCambiarPitcherOpen(true);
  };
  
  /**
   * Manejar el cambio de pitcher
   */
  const handleCambiarPitcher = (pitcherId: number, nombreCompleto: string) => {
    const tipo = tipoPitcherACambiar;
    
    if (!partido) return;
    
    const equipoNombre = tipo === 'local' ? partido.equipoLocal.nombre : partido.equipoVisitante.nombre;
    
    // Marcar al pitcher actual como que salió en este inning
    setPitchersEnPartido(prev => 
      prev.map(p => {
        const idActual = tipo === 'local' ? pitcherActivoLocalId : pitcherActivoVisitanteId;
        if (p.id === idActual && !p.salioEnInning) {
          return { ...p, salioEnInning: inning };
        }
        return p;
      })
    );
    
    // Crear el nuevo pitcher con el ID real
    const nuevoId = String(pitcherId);
    const nuevoPitcher: PitcherEnPartido = {
      id: nuevoId,
      nombre: nombreCompleto,
      equipo: equipoNombre,
      tipo: tipo,
      entroEnInning: inning,
    };
    
    // Agregar el nuevo pitcher
    setPitchersEnPartido(prev => [...prev, nuevoPitcher]);
    
    // Actualizar el pitcher activo
    if (tipo === 'local') {
      setPitcherActivoLocalId(nuevoId);
    } else {
      setPitcherActivoVisitanteId(nuevoId);
    }
    
    console.log(`⚾ Relevo: ${nombreCompleto} (ID: ${pitcherId}) entra a lanzar en el inning ${inning}`);
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
    const pitcherActual = getPitcherActivo();
    const nuevoLanzamiento: LanzamientoGuardado = {
      ...data, // tipo, resultado, velocidad, comentario
      zona: selectedZone ?? 0, // La zona donde se clickeó
      pitcher: activePitcher, // Quién lanzó (local o visitante)
      timestamp: new Date(), // Cuándo se registró
      inning: inning, // En qué inning
      ladoInning: ladoInning, // Si estaba abriendo o cerrando
      pitcherId: pitcherActual.id, // ID del pitcher que lanzó
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

        {/* Estado de carga */}
        {loadingPartido && (
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <p className="text-gray-600">Cargando datos del partido...</p>
          </div>
        )}

        {/* Error si no existe el partido */}
        {!loadingPartido && !partido && (
          <div className="bg-white p-8 rounded-lg shadow-xl text-center">
            <p className="text-red-600">No se pudo cargar el partido</p>
          </div>
        )}

        {/* 3. TARJETA BLANCA DE CONTENIDO */}
        {partido && (
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
            localPitcher={{
              nombre: pitcherLocalActivo?.nombre || '',
              equipo: pitcherLocalActivo?.equipo || ''
            }}
            visitantePitcher={{
              nombre: pitcherVisitanteActivo?.nombre || '',
              equipo: pitcherVisitanteActivo?.equipo || ''
            }}
            onCambiarPitcher={handleAbrirModalCambiarPitcher}
          />

          {/* --- ZONA DE STRIKE --- */}
          <section className="flex flex-col items-center mt-6">
            {/* Contador de lanzamientos registrados del pitcher activo */}
            <div className="mb-4 text-center">
              <p className="text-lg font-semibold text-gray-700">
                Lanzamientos Registrados ({getPitcherActivo().nombre}): 
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
          {lanzamientos.length > 0 && partido && (
            <section className="mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
                Historial de Lanzamientos por Pitcher
              </h2>
              
              {/* Grid de 2 columnas para las cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* COLUMNA IZQUIERDA: PITCHERS LOCALES */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center uppercase tracking-wide">
                    {partido.equipoLocal.nombre}
                  </h3>
                  <div className="space-y-3">
                    {/* Mostrar todos los pitchers locales que han lanzado */}
                    {pitchersEnPartido
                      .filter(p => p.tipo === 'local')
                      .map(pitcher => {
                        const lanzamientosPitcher = lanzamientos.filter(l => l.pitcherId === pitcher.id);
                        const innings = lanzamientosPitcher.map(l => l.inning);
                        const inningsRange = innings.length > 0 
                          ? (Math.min(...innings) === Math.max(...innings) 
                            ? `${Math.min(...innings)}` 
                            : `${Math.min(...innings)}-${Math.max(...innings)}`)
                          : '-';
                        
                        return (
                          <PitcherCard
                            key={pitcher.id}
                            nombre={pitcher.nombre}
                            equipo={pitcher.equipo}
                            cantidadLanzamientos={lanzamientosPitcher.length}
                            innings={inningsRange}
                            onClick={() => {
                              // TODO: Navegar a página de detalle
                              console.log('Click en pitcher:', pitcher.nombre);
                            }}
                            tipo="local"
                          />
                        );
                      })
                    }
                  </div>
                </div>

                {/* COLUMNA DERECHA: PITCHERS VISITANTES */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3 text-center uppercase tracking-wide">
                    {partido.equipoVisitante.nombre}
                  </h3>
                  <div className="space-y-3">
                    {/* Mostrar todos los pitchers visitantes que han lanzado */}
                    {pitchersEnPartido
                      .filter(p => p.tipo === 'visitante')
                      .map(pitcher => {
                        const lanzamientosPitcher = lanzamientos.filter(l => l.pitcherId === pitcher.id);
                        const innings = lanzamientosPitcher.map(l => l.inning);
                        const inningsRange = innings.length > 0 
                          ? (Math.min(...innings) === Math.max(...innings) 
                            ? `${Math.min(...innings)}` 
                            : `${Math.min(...innings)}-${Math.max(...innings)}`)
                          : '-';
                        
                        return (
                          <PitcherCard
                            key={pitcher.id}
                            nombre={pitcher.nombre}
                            equipo={pitcher.equipo}
                            cantidadLanzamientos={lanzamientosPitcher.length}
                            innings={inningsRange}
                            onClick={() => {
                              // TODO: Navegar a página de detalle
                              console.log('Click en pitcher:', pitcher.nombre);
                            }}
                            tipo="visitante"
                          />
                        );
                      })
                    }
                  </div>
                </div>

              </div>
            </section>
          )}

        </div>
        )}
        
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
        
        {/* --- MODAL PARA CAMBIAR PITCHER --- */}
        {partido && (
          <CambiarPitcherModal
            open={isModalCambiarPitcherOpen}
            onClose={() => setIsModalCambiarPitcherOpen(false)}
            tipo={tipoPitcherACambiar}
            equipoNombre={
              tipoPitcherACambiar === 'local' 
                ? partido.equipoLocal.nombre 
                : partido.equipoVisitante.nombre
            }
            pitchersDisponibles={
              // Filtrar pitchers que ya están en el partido
              (tipoPitcherACambiar === 'local'
                ? partido.equipoLocal.pitchers
                : partido.equipoVisitante.pitchers
              ).filter(pitcher => 
                // Excluir pitchers que ya han lanzado en este partido
                !pitchersEnPartido.some(p => p.id === String(pitcher.id))
              )
            }
            onCambiar={handleCambiarPitcher}
          />
        )}

      </div>
    </main>
  );
}