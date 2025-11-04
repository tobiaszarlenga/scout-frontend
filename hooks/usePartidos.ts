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
  const create = useMutation({
    // Recibe los datos del formulario (CreatePartidoInput)
    mutationFn: (data: CreatePartidoInput) =>
      // 'crearPartido' en el backend devuelve el partido base (tipo 'Partido')
      api.post<Partido>('/partidos', data),
    
    // Invalida la caché para que la lista se recargue sola
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { list, create };
}

// --- Hook para obtener un partido específico ---
export function usePartido(id: string | number) {
  return useQuery({
    queryKey: [...KEY, 'detail', String(id)],
    queryFn: () => api.get<PartidoParaScout>(`/partidos/${id}`),
    enabled: !!id, // Solo ejecuta si hay un ID válido
  });
}