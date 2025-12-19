// scout-frontend/hooks/useLanzamientos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { lanzamientosApi, type CreateLanzamientoDto } from '@/lib/api';

const KEY = ['lanzamientos'];

export function useLanzamientos(partidoId: string | number) {
  const qc = useQueryClient();

  const list = useQuery({
    queryKey: [...KEY, String(partidoId)],
    queryFn: () => lanzamientosApi.listByPartido(partidoId),
    enabled: !!partidoId,
  });

  const create = useMutation({
    mutationFn: (data: CreateLanzamientoDto) => lanzamientosApi.create(partidoId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, String(partidoId)] }),
  });

  const update = useMutation({
    mutationFn: (payload: { id: number; data: Partial<CreateLanzamientoDto> }) =>
      lanzamientosApi.update(payload.id, payload.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, String(partidoId)] }),
  });

  const remove = useMutation({
    mutationFn: (id: number) => lanzamientosApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...KEY, String(partidoId)] }),
  });

  return { list, create, update, remove };
}
