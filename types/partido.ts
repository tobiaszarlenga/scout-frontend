// En /types/partido.ts
import type { Equipo } from './equipo'; // Importamos tu tipo existente
import type { Pitcher } from './pitcher'; // Importamos el tipo de pitcher

// Este tipo representa la tabla 'Partido'
export interface Partido {
  id: number;
  fecha: Date; // Usaremos Date de JS
  horario: string;
  campo: string | null;
  estado: string; // "PROGRAMADO" o "FINALIZADO"
  equipoLocalId: number;
  equipoVisitanteId: number;
  pitcherLocalId: number;
  pitcherVisitanteId: number;
  
  creadoEn: Date;
  actualizadoEn: Date;
}

// Este tipo "anidado" es el que usaremos en las listas
export type PartidoConDetalles = Partido & {
  equipoLocal: Pick<Equipo, 'nombre'>;
  equipoVisitante: Pick<Equipo, 'nombre'>;
  pitcherLocal: Pick<Pitcher, 'nombre' | 'apellido'>;
  pitcherVisitante: Pick<Pitcher, 'nombre' | 'apellido'>;
};