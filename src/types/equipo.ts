// src/types/equipo.ts
export interface Equipo {
  id: number;
  nombre: string;
  ciudad: string | null;
  // Agregá createdAt/updatedAt si existen en tu schema
}
