// scout-frontend/types/partido.ts

import type { Equipo } from './equipo';
import type { Pitcher } from './pitcher'; // Asumo que tienes 'types/pitcher.ts'

// --- 1. Tipo para CREAR (El formulario) ---
// Este es el tipo que define los datos que enviamos en el POST
export type CreatePartidoInput = {
  equipoLocalId: number;
  equipoVisitanteId: number;
  pitcherLocalId: number;
  pitcherVisitanteId: number;
  fecha: string;    // "dd/mm/yyyy"
  horario: string;  // "HH:mm"
  campo?: string;
};

// --- 2. Tipo BASE (Coincide con el modelo Prisma) ---
// Ajustado para coincidir con la respuesta JSON de la API
export interface Partido {
  id: number;
  // JSON no tiene tipo 'Date', devuelve strings en formato ISO
  fecha: string; // ej: "2025-10-21T18:00:00.000Z"
  campo: string | null;
  // Usamos un tipo unión para ser más específicos
  estado: 'PROGRAMADO' | 'FINALIZADO' | 'CANCELADO';
  
  // IDs de relaciones
  equipoLocalId: number;
  equipoVisitanteId: number;
  pitcherLocalId: number;
  pitcherVisitanteId: number;
  autorId: number; // El backend también devuelve esto
  
  // Campos de Prisma (devueltos como string por JSON)
  creadoEn: string;
  actualizadoEn: string;
}

// --- 3. Tipo para LISTAR (Con detalles) ---
// ¡Tu tipo PartidoConDetalles ya era perfecto!
// Lo usamos para la respuesta de 'listarPartidos' que incluye los nombres
export type PartidoConDetalles = Partido & {
  equipoLocal: Pick<Equipo, 'nombre'>;
  equipoVisitante: Pick<Equipo, 'nombre'>;
  pitcherLocal: Pick<Pitcher, 'nombre' | 'apellido'>;
  pitcherVisitante: Pick<Pitcher, 'nombre' | 'apellido'>;
};

// --- 4. Tipo para SCOUT (Con todos los pitchers del equipo) ---
// Este tipo se usa en la página de scout donde necesitamos todos los pitchers
export type PartidoParaScout = Partido & {
  equipoLocal: {
    id: number;
    nombre: string;
    pitchers: Pick<Pitcher, 'id' | 'nombre' | 'apellido' | 'numero_camiseta'>[];
  };
  equipoVisitante: {
    id: number;
    nombre: string;
    pitchers: Pick<Pitcher, 'id' | 'nombre' | 'apellido' | 'numero_camiseta'>[];
  };
  pitcherLocal: Pick<Pitcher, 'id' | 'nombre' | 'apellido' | 'numero_camiseta'>;
  pitcherVisitante: Pick<Pitcher, 'id' | 'nombre' | 'apellido' | 'numero_camiseta'>;
};