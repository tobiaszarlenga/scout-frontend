// hooks/useEquipos.ts
"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Equipo } from '@/types/equipo'

// Esta es la "llave" que usa React Query para cachear los datos de equipos.
const KEY = ['equipos'];

export function useEquipos() {
  const queryClient = useQueryClient();

  // HOOK para LEER (GET) la lista de todos los equipos
  const list = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const response = await api.get<Equipo[]>('/equipos');
      return response.data;
    },
  });

  // MUTACIÓN para CREAR (POST) un nuevo equipo
  const create = useMutation({
    mutationFn: async (data: Pick<Equipo, 'nombre' | 'ciudad'>) => {
      const response = await api.post<Equipo>('/equipos', data);
      return response.data;
    },
    // Cuando la creación es exitosa, invalidamos la caché de la lista para que se actualice.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  // MUTACIÓN para ACTUALIZAR (PUT) un equipo existente
  const update = useMutation({
    mutationFn: async (variables: { id: number; data: Partial<Pick<Equipo, 'nombre' | 'ciudad'>> }) => {
      const response = await api.put<Equipo>(`/equipos/${variables.id}`, variables.data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  // MUTACIÓN para BORRAR (DELETE) un equipo
  const remove = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/equipos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEY });
    },
  });

  // Devolvemos todas las funciones para que los componentes puedan usarlas
  return { list, create, update, remove };
}