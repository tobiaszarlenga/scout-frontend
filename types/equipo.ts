// src/types/equipo.ts
// types/equipo.ts

// Este es el tipo para un equipo que YA EXISTE en la base de datos (tiene id, etc.)
export type Equipo = {
  id: number;
  nombre: string;
  ciudad?: string | null; // Opcional
  creadoEn: string;
  actualizadoEn: string;
  autorId: number;
};

// ¡NUEVO! Este es el tipo para los DATOS NECESARIOS PARA CREAR un equipo.
// Lo exportamos para que toda la aplicación pueda usarlo.
export type CreateEquipoInput = {
  nombre: string;
  ciudad?: string | null;
  autorId: number;
};