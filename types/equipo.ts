// types/equipo.ts
export type Equipo = {
  id: number;
  nombre: string;
  ciudad: string | null;
  // No incluimos creadoEn o actualizadoEn a menos que los necesites en el frontend.
};