// hooks/usePitchers.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pitcherApi } from '@/lib/api';
import type { CreatePitcherDto } from '@/types/pitcher';

export const usePitchers = () => {
  const queryClient = useQueryClient();

  // QUERY: Para obtener la lista de pitchers
  const list = useQuery({
    queryKey: ['pitchers'],
    queryFn: pitcherApi.getAll,
  });

  // MUTATION: Para eliminar un pitcher
  const remove = useMutation({
    mutationFn: pitcherApi.delete,
    onSuccess: () => {
      // Invalida la query de pitchers para que se vuelva a cargar la lista actualizada
      queryClient.invalidateQueries({ queryKey: ['pitchers'] });
    },
  });

  // MUTATION: Para crear un pitcher
  const create = useMutation({
    mutationFn: pitcherApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitchers'] });
    },
  });

  // MUTATION: Para actualizar un pitcher
  const update = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePitcherDto> }) =>
      pitcherApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pitchers'] });
    },
  });

  return { list, remove, create, update };
};