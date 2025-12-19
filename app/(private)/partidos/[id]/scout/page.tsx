// En: app/(private)/partidos/[id]/scout/page.tsx
'use client';

// (Importamos 'useState' y 'useEffect' que necesitamos)
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
import { usePartido, usePartidos } from '@/hooks/usePartidos';
import { useLanzamientos } from '@/hooks/useLanzamientos';
import { useScout } from '@/context/ScoutContext';
import type { ActivePitcher, LanzamientoGuardado, PitcherEnPartido } from '@/types/scout';
import type { CreateLanzamientoDto } from '@/lib/api';

// --- Importamos los componentes ---
import PitcherCard from './PitcherCard';
import CambiarPitcherModal from '@/app/(private)/partidos/CambiarPitcherModal';
import ConfirmDialog from '@/app/components/ConfirmDialog';
import { toast } from 'react-hot-toast';

export default function ScoutPage({ params }: { params: Promise<{ id: string }> }) {
  
  // --- Unwrap params (Next.js 15+) ---
  const { id } = React.use(params);
  const router = useRouter();
  
  // --- Cargar datos del partido desde la API ---
  const { data: partido, isLoading: loadingPartido } = usePartido(id);
  
  // --- Cargamos los lookups (tipos y resultados) ---
  const { tipos, resultados } = useLookups();
  
  // --- Hook para lanzamientos (listar/crear) ---
  const { list: lanzamientosRemotos, create: createLanzamiento } = useLanzamientos(id);
  const [activePitcher, setActivePitcher] = useState<ActivePitcher>('local');
  
  // --- Lista de pitchers que han lanzado en el partido ---
  const [pitchersEnPartido, setPitchersEnPartido] = useState<PitcherEnPartido[]>([]);
  
  // --- ID del pitcher actualmente lanzando (local y visitante) ---
  const [pitcherActivoLocalId, setPitcherActivoLocalId] = useState<string>('');
  const [pitcherActivoVisitanteId, setPitcherActivoVisitanteId] = useState<string>('');
  
  // --- Inicializar pitchers cuando carguen los datos del partido ---
  useEffect(() => {
    if (!partido) return;
    // Si ya restauramos desde localStorage/context, no sobrescribimos
    if (pitchersEnPartido.length > 0) return;
    if (pitcherActivoLocalId || pitcherActivoVisitanteId) return;

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
  }, [partido, pitchersEnPartido.length, pitcherActivoLocalId, pitcherActivoVisitanteId]);

  // --- Cargar lanzamientos persistidos desde el backend ---
  const xyToZona = (x: number, y: number) => y * 5 + x;
  useEffect(() => {
    if (!lanzamientosRemotos.data || !partido) return;
    const isLocalPitcherId = (pid: number) =>
      partido.equipoLocal.pitchers.some((p) => p.id === pid);
    const mapped: LanzamientoGuardado[] = lanzamientosRemotos.data.map((l) => ({
      velocidad: l.velocidad ?? null,
      tipoId: l.tipoId ?? null,
      resultadoId: l.resultadoId ?? null,
      zona: xyToZona(l.x, l.y),
      pitcher: isLocalPitcherId(l.pitcherId) ? 'local' : 'visitante',
      timestamp: new Date(l.creadoEn),
      inning: l.inning,
      ladoInning: l.ladoInning as 'abre' | 'cierra',
      pitcherId: String(l.pitcherId),
    }));
    setLanzamientos(mapped);
  }, [lanzamientosRemotos.data, partido]);
  
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
  // --- Persistencia ligera en localStorage de contadores/activos ---
  const LS_KEY = `scoutState:${id}`;
  const [initialLoaded, setInitialLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null;
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.inning === 'number') setInning(s.inning);
        if (typeof s.bolas === 'number') setBolas(s.bolas);
        if (typeof s.strikes === 'number') setStrikes(s.strikes);
        if (typeof s.outs === 'number') setOuts(s.outs);
        if (s.ladoInning === 'abre' || s.ladoInning === 'cierra') setLadoInning(s.ladoInning);
        if (s.activePitcher === 'local' || s.activePitcher === 'visitante') setActivePitcher(s.activePitcher);
        if (typeof s.pitcherActivoLocalId === 'string') setPitcherActivoLocalId(s.pitcherActivoLocalId);
        if (typeof s.pitcherActivoVisitanteId === 'string') setPitcherActivoVisitanteId(s.pitcherActivoVisitanteId);
        if (Array.isArray(s.pitchersEnPartido) && s.pitchersEnPartido.length > 0) setPitchersEnPartido(s.pitchersEnPartido);
      }
    } catch {}
    finally {
      setInitialLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  useEffect(() => {
    if (!initialLoaded) return; // Evita sobreescribir antes de la primera carga
    const snapshot = {
      inning,
      bolas,
      strikes,
      outs,
      ladoInning,
      activePitcher,
      pitcherActivoLocalId,
      pitcherActivoVisitanteId,
      pitchersEnPartido,
    };
    try {
      if (typeof window !== 'undefined') localStorage.setItem(LS_KEY, JSON.stringify(snapshot));
    } catch {}
  }, [LS_KEY, initialLoaded, inning, bolas, strikes, outs, ladoInning, activePitcher, pitcherActivoLocalId, pitcherActivoVisitanteId, pitchersEnPartido]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 'selectedZone' guarda el número (0-24) de la zona clickeada.
  const [selectedZone, setSelectedZone] = useState<number | null>(null);

  // --- NUEVO 3: LA "CAJA" DONDE GUARDAMOS TODOS LOS LANZAMIENTOS ---
  // Este array irá creciendo cada vez que se registre un lanzamiento
  const [lanzamientos, setLanzamientos] = useState<LanzamientoGuardado[]>([]);
  
  // --- Sincronización con el contexto global de Scout ---
  const scout = useScout();
  const { finalizar } = usePartidos();
  // Cargar si existe previamente
  useEffect(() => {
    const prev = scout.getState(id);
    if (prev) {
      // Deduplicar pitchers por ID para evitar duplicados
      const pitchersDeduped = Array.from(
        new Map((prev.pitchersEnPartido ?? []).map(p => [p.id, p])).values()
      );
      setPitchersEnPartido(pitchersDeduped);
      setLanzamientos(prev.lanzamientos ?? []);
      // Restaurar contadores si existen
      if (typeof prev.inning === 'number') setInning(prev.inning);
      if (typeof prev.bolas === 'number') setBolas(prev.bolas);
      if (typeof prev.strikes === 'number') setStrikes(prev.strikes);
      if (typeof prev.outs === 'number') setOuts(prev.outs);
      if (prev.ladoInning) setLadoInning(prev.ladoInning);
      if (prev.activePitcher) setActivePitcher(prev.activePitcher);
      if (prev.pitcherActivoLocalId) setPitcherActivoLocalId(prev.pitcherActivoLocalId);
      if (prev.pitcherActivoVisitanteId) setPitcherActivoVisitanteId(prev.pitcherActivoVisitanteId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);
  // Guardar cuando cambie pitchersEnPartido (no lanzamientos, porque esos se agregan con addLanzamiento)
  // Importante: no incluimos `scout` en dependencias para evitar recrear el efecto
  // en cada actualización del contexto y producir un bucle infinito.
  useEffect(() => {
    // Persistimos el estado completo del partido (lanzamientos, pitchers y contadores)
    // Evitamos persistir cuando no hay pitchers (estado vacío inicial)
    if (pitchersEnPartido.length === 0 && (scout.getState(id)?.pitchersEnPartido ?? []).length === 0) return;

    const newState = {
      lanzamientos,
      pitchersEnPartido,
      inning,
      bolas,
      strikes,
      outs,
      ladoInning,
      activePitcher,
      pitcherActivoLocalId,
      pitcherActivoVisitanteId,
    };

    scout.setStateForPartido(id, newState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, pitchersEnPartido, lanzamientos, inning, bolas, strikes, outs, ladoInning, activePitcher, pitcherActivoLocalId, pitcherActivoVisitanteId]);
  
  // --- Estados para el modal de cambiar pitcher ---
  const [isModalCambiarPitcherOpen, setIsModalCambiarPitcherOpen] = useState(false);
  const [tipoPitcherACambiar, setTipoPitcherACambiar] = useState<ActivePitcher>('local');

  // (Datos falsos) - Eliminados; ahora usamos datos reales del partido
  
  // --- Obtener el pitcher activo actual de cada lado ---
  const pitcherLocalActivo = pitchersEnPartido.find(p => p.id === pitcherActivoLocalId);
  const pitcherVisitanteActivo = pitchersEnPartido.find(p => p.id === pitcherActivoVisitanteId);
  
  // --- Filtrar lanzamientos del pitcher activo ACTUAL (por tipo Y por ID de pitcher) ---
  const lanzamientosDelPitcherActivo = lanzamientos.filter(l => {
    if (activePitcher === 'local') {
      return l.pitcher === 'local' && l.pitcherId === pitcherActivoLocalId;
    } else {
      return l.pitcher === 'visitante' && l.pitcherId === pitcherActivoVisitanteId;
    }
  });
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
    const nuevoId = String(pitcherId);
    
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
    
    // Verificar si el pitcher ya existe en la lista
    const pitcherYaExiste = pitchersEnPartido.some(p => p.id === nuevoId);
    
    if (!pitcherYaExiste) {
      // Si no existe, agregarlo
      const nuevoPitcher: PitcherEnPartido = {
        id: nuevoId,
        nombre: nombreCompleto,
        equipo: equipoNombre,
        tipo: tipo,
        entroEnInning: inning,
      };
      setPitchersEnPartido(prev => [...prev, nuevoPitcher]);
    }
    
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
  const handleFormSubmit = async (data: LanzamientoData) => {
    console.log('--- ¡NUEVO LANZAMIENTO REGISTRADO! ---');
    console.log('Datos del Formulario:', data);
    console.log('Pitcher Activo:', activePitcher);
    console.log('Zona Seleccionada:', selectedZone);

    // Validación extra de seguridad (además del formulario)
    if (!data.tipoId || !data.resultadoId) {
      alert('Seleccioná Tipo de Efecto y Resultado para guardar el lanzamiento.');
      return;
    }

    // Persistir primero en backend para evitar inconsistencias
    const pitcherActual = getPitcherActivo();
    try {
      const payload: CreateLanzamientoDto = {
        tipoId: data.tipoId,
        resultadoId: data.resultadoId,
        velocidad: data.velocidad ?? null,
        zona: selectedZone ?? 0,
        inning,
        ladoInning,
        pitcherId: Number(pitcherActual.id),
      };
      await createLanzamiento.mutateAsync(payload);
      console.log('💾 Lanzamiento persistido en backend');

      // --- GUARDAR EN LA "CAJA" (ARRAY) UNA VEZ CONFIRMADO ---
      const nuevoLanzamiento: LanzamientoGuardado = {
        ...data,
        zona: selectedZone ?? 0,
        pitcher: activePitcher,
        timestamp: new Date(),
        inning,
        ladoInning,
        pitcherId: pitcherActual.id,
      };

      setLanzamientos((prev) => [...prev, nuevoLanzamiento]);
      scout.addLanzamiento(id, nuevoLanzamiento);
      console.log('✅ Lanzamiento guardado en el array y contexto:', nuevoLanzamiento);

      // --- PROCESAR LA LÓGICA DEL BÉISBOL ---
      procesarResultado(data.resultadoId);

      handleCloseModal();
    } catch (err) {
      console.warn('No se pudo persistir el lanzamiento. Se cancela el guardado local.', err);
    }
  };

  // Volver a la lista de partidos
  const handleVolver = () => {
    router.push('/partidos');
  };

  // Finalizar partido: marcar en backend y limpiar contexto local
  const handleFinalizarPartido = async () => {
    // Abrir el diálogo de confirmación
    setConfirmFinalizarOpen(true);
  };

  const [confirmFinalizarOpen, setConfirmFinalizarOpen] = useState(false);

  const confirmFinalizarPartido = async () => {
    try {
      await finalizar.mutateAsync(Number(id));
      scout.clearPartido(id);
      toast.success('Partido finalizado');
      router.push('/partidos');
    } catch (err) {
      console.error('Error finalizando partido', err);
      const errorMessage = err instanceof Error ? err.message : 'No se pudo finalizar el partido. Intenta de nuevo.';
      toast.error(errorMessage);
    } finally {
      setConfirmFinalizarOpen(false);
    }
  };

  return (
    // 1. Tu layout principal (usa variables globales para soportar theme)
    <main
      className="min-h-full w-full max-w-full overflow-x-hidden px-6 py-6 sm:px-10 sm:py-8"
      style={{ background: `linear-gradient(160deg, var(--color-bg), var(--color-sidebar))`, color: 'var(--color-text)' }}
    >
      <div className="mx-auto w-full max-w-6xl">
        
        {/* 2. Cabecera (Scouting en Vivo) */}
        <header className="flex items-center justify-between pb-8">
          <div>
            <button onClick={handleVolver} className="text-sm hover:opacity-80" style={{ color: 'var(--color-muted)' }}>
              &larr; Volver a Partidos
            </button>
            <h1 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--color-text)', textShadow: '2px 2px 4px rgba(0,0,0,0.15)' }}>
              Scouting en Vivo
            </h1>
          </div>
          <button
            onClick={handleFinalizarPartido}
            disabled={finalizar.status === 'pending'}
            className="px-4 py-2 rounded-lg shadow transition-colors disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-on-accent)' }}
          >
            {finalizar.status === 'pending' ? 'Finalizando...' : 'Finalizar Partido'}
          </button>
        </header>

        {/* Estado de carga */}
        {loadingPartido && (
          <div className="p-8 rounded-lg shadow-xl text-center" style={{ backgroundColor: 'var(--color-card)' }}>
            <p style={{ color: 'var(--color-muted)' }}>Cargando datos del partido...</p>
          </div>
        )}

        {/* Error si no existe el partido */}
        {!loadingPartido && !partido && (
          <div className="p-8 rounded-lg shadow-xl text-center" style={{ backgroundColor: 'var(--color-card)' }}>
            <p style={{ color: 'var(--color-accent)' }}>No se pudo cargar el partido</p>
          </div>
        )}

        {/* 3. TARJETA BLANCA DE CONTENIDO */}
  {partido && (
  <div className="p-4 md:p-6 rounded-lg shadow-xl" style={{ backgroundColor: 'var(--color-card)' }}>
          
          {/* --- MARCADOR (INNING, CUENTA, OUTS) --- */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <ScoutCounterCard
              title="Inning"
              value={inning}
              onChange={handleInningChange}
              footerText={
                ladoInning === 'abre' 
                  ? `${partido.equipoLocal.nombre} abre` 
                  : `${partido.equipoVisitante.nombre} cierra`
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
              <p className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
                Lanzamientos Registrados ({activePitcher === 'local' ? (pitcherLocalActivo?.nombre ?? '-') : (pitcherVisitanteActivo?.nombre ?? '-')}): 
                <span className="ml-2 text-2xl font-bold" style={{ color: 'var(--color-accent)' }}>{lanzamientosDelPitcherActivo.length}</span>
              </p>
              {ultimoLanzamiento && (
                <p className="text-sm mt-1" style={{ color: 'var(--color-muted)' }}>
                  Último: {getTipoNombre(ultimoLanzamiento.tipoId)} - 
                  {getResultadoNombre(ultimoLanzamiento.resultadoId)} - 
                  Zona {ultimoLanzamiento.zona}
                </p>
              )}
            </div>

            {/* --- NUEVO 4: PASAMOS LA PROP 'onZoneClick' --- */}
            <StrikeZoneGrid onZoneClick={handleZoneClick} highlightedZone={selectedZone} />
          </section>

          {/* --- CARDS DE PITCHERS --- */}
                {lanzamientos.length > 0 && partido && (
                <section className="mt-8">
              <h2 className="text-xl font-bold mb-4 text-center" style={{ color: 'var(--color-text)' }}>
                Historial de Lanzamientos por Pitcher
              </h2>
              
              {/* Grid de 2 columnas para las cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* COLUMNA IZQUIERDA: PITCHERS LOCALES */}
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-center uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>
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
                              router.push(`/partidos/${id}/pitcher/${pitcher.id}`);
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
                  <h3 className="text-lg font-semibold mb-3 text-center uppercase tracking-wide" style={{ color: 'var(--color-text)' }}>
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
                              router.push(`/partidos/${id}/pitcher/${pitcher.id}`);
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
          {/*
            Forzamos el remount del formulario usando 'key' ligado a
            selectedZone. Así, cada vez que abrimos el modal con una
            zona diferente el form se remonta y limpia sus estados
            internos (evita comportamientos residuales).
          */}
          <RegistrarLanzamientoForm
            key={selectedZone ?? 'no-zone'}
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
              // Mostrar todos los pitchers del equipo excepto el pitcher actualmente activo
              (tipoPitcherACambiar === 'local' ? partido.equipoLocal.pitchers : partido.equipoVisitante.pitchers
              ).filter(pitcher => {
                const activeId = tipoPitcherACambiar === 'local' ? pitcherActivoLocalId : pitcherActivoVisitanteId;
                return String(pitcher.id) !== activeId;
              })
            }
            onCambiar={handleCambiarPitcher}
          />
        )}

      </div>
        <ConfirmDialog
          open={confirmFinalizarOpen}
          title="Finalizar Partido"
          message={`¿Deseas finalizar este partido? Esta acción lo moverá a Partidos Finalizados.`}
          confirmLabel="Finalizar"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={confirmFinalizarPartido}
          onCancel={() => setConfirmFinalizarOpen(false)}
        />
    </main>
  );
}