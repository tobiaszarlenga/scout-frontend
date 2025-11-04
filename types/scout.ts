// types/scout.ts
import type { LanzamientoData } from '@/app/(private)/partidos/RegistrarLanzamientoForm';

export type ActivePitcher = 'local' | 'visitante';

export interface LanzamientoGuardado extends LanzamientoData {
  zona: number; // Índice 0-24
  pitcher: ActivePitcher; // 'local' | 'visitante'
  timestamp: Date;
  inning: number;
  ladoInning: 'abre' | 'cierra';
  pitcherId: string; // ID del pitcher que lanzó
}

export interface PitcherEnPartido {
  id: string; // Puede ser ID de BD (string)
  nombre: string;
  equipo: string;
  tipo: ActivePitcher;
  entroEnInning: number;
  salioEnInning?: number;
}
