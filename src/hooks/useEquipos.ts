import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Equipo } from '@/types/equipo';

const KEY = ['equipos'];

export function useEquipos() {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: KEY,
    queryFn: () => api.get<Equipo[]>('/equipos'),
  });

  const create = useMutation({
    mutationFn: (data: Pick<Equipo, 'nombre' | 'ciudad'>) =>
      api.post<Equipo>('/equipos', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const update = useMutation({
    mutationFn: (p: { id: number; data: Partial<Pick<Equipo, 'nombre' | 'ciudad'>> }) =>
      api.put<Equipo>(`/equipos/${p.id}`, p.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/equipos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { list, create, update, remove };
}
