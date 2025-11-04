// scout-frontend/lib/api.ts

import type { Pitcher, CreatePitcherDto } from '@/types/pitcher';
export const API_URL = process.env.NEXT_PUBLIC_API_URL!;

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...options,
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) msg = data.error;
    } catch {}
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Tu objeto 'api' original. No necesita cambios.
export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path: string) =>
    request<void>(path, { method: 'DELETE' }),
};
export const pitcherApi = {
  getAll: () => api.get<Pitcher[]>('/pitchers'),
  create: (data: CreatePitcherDto) => api.post<Pitcher>('/pitchers', data),
  update: (id: number, data: Partial<CreatePitcherDto>) => api.put<Pitcher>(`/pitchers/${id}`, data),
  delete: (id: number) => api.delete(`/pitchers/${id}`),
};

// Podrías tener otros objetos similares aquí, por ejemplo:
// export const equipoApi = { ... };

// Lanzamientos API
export interface CreateLanzamientoDto {
  tipoId: number;
  resultadoId: number;
  velocidad?: number | null;
  comentario?: string | null;
  zona?: number; // índice 0..24, el backend lo convertirá a x,y
  x?: number;
  y?: number;
  inning: number;
  ladoInning: 'abre' | 'cierra';
  pitcherId: number;
}

export interface LanzamientoDTO {
  id: number;
  partidoId: number;
  tipoId: number;
  resultadoId: number;
  velocidad: number | null;
  comentario: string | null;
  x: number;
  y: number;
  inning: number;
  ladoInning: 'abre' | 'cierra';
  pitcherId: number;
  creadoEn: string;
}

export const lanzamientosApi = {
  listByPartido: (partidoId: string | number) =>
    api.get<LanzamientoDTO[]>(`/partidos/${partidoId}/lanzamientos`),
  create: (partidoId: string | number, data: CreateLanzamientoDto) =>
    api.post<LanzamientoDTO>(`/partidos/${partidoId}/lanzamientos`, data),
  update: (id: number, data: Partial<CreateLanzamientoDto>) =>
    api.put<LanzamientoDTO>(`/lanzamientos/${id}`, data),
  delete: (id: number) => api.delete(`/lanzamientos/${id}`),
};