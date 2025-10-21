// En /types/pitcher.ts
import type { Equipo } from './equipo'; // Importamos el tipo Equipo

// Representa un pitcher completo, como viene del backend
export interface Pitcher {
  id: number;
  nombre: string;
  apellido: string;
  edad: number;
  numero_camiseta: number;
  equipoId: number;
  creadoEn: string;      // Lo tomamos de tu api.ts
  actualizadoEn: string; // Lo tomamos de tu api.ts
  equipo?: Equipo;         // Lo tomamos de tu api.ts
}

// Representa los datos necesarios para CREAR un pitcher
// (También lo movemos aquí)
export type CreatePitcherDto = Omit<Pitcher, 'id' | 'creadoEn' | 'actualizadoEn' | 'equipo'>;