// scout-frontend/hooks/usePartidos.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from 'lib/api';
// ¡Importamos los tipos!
import type {
  Partido,
  CreatePartidoInput,
  PartidoConDetalles,
  PartidoParaScout,
} from 'types/partido';

// Llave para la caché de React Query
const KEY = ['partidos'];

export function usePartidos() {
  const qc = useQueryClient();

  // --- OBTENER la lista de partidos ---
  // Llama a: GET /api/partidos
  const list = useQuery({
    queryKey: KEY,
    // Usamos 'PartidoConDetalles[]' porque 'listarPartidos'
    // es la ruta que devuelve los 'includes' con los nombres.
    queryFn: () => api.get<PartidoConDetalles[]>('/partidos'),
  });

  // --- CREAR un nuevo partido ---
  // Llama a: POST /api/partidos
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: KEY });
    qc.invalidateQueries({ queryKey: [...KEY, 'detail'] });
  };

  const create = useMutation({
    mutationFn: (data: CreatePartidoInput) => api.post<Partido>('/partidos', data),
    onSuccess: invalidateAll,
  });

  const finalizar = useMutation({
    mutationFn: (partidoId: number) => api.put(`/partidos/${partidoId}/finalizar`, {}),
    onSuccess: invalidateAll,
  });

  const edit = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CreatePartidoInput> }) =>
      api.put<Partido>(`/partidos/${id}`, data),
    onSuccess: invalidateAll,
  });

  const remove = useMutation({
    mutationFn: (partidoId: number) => api.delete(`/partidos/${partidoId}`),
    onSuccess: invalidateAll,
  });

  return { list, create, finalizar, edit, remove };
}

// --- Hook para obtener un partido específico ---
export function usePartido(id: string | number) {
  return useQuery({
    queryKey: [...KEY, 'detail', String(id)],
    queryFn: () => api.get<PartidoParaScout>(`/partidos/${id}`),
    enabled: !!id, // Solo ejecuta si hay un ID válido
  });
}