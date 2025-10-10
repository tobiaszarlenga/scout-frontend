// src/types/equipo.ts
export type Equipo = {
  id: number;
  nombre: string;
  ciudad?: string; // opcional, según tu modelo
  creadoEn?: string;
  actualizadoEn?: string;
};

// Alias para crear equipo (usado en el modal)
export type CreateEquipoInput = Pick<Equipo, "nombre" | "ciudad">;
