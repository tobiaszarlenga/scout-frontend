// hooks/useEquipos.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from 'lib/api';
// ¡MODIFICADO! Importamos AMBOS tipos desde nuestro archivo central.
import type { Equipo, CreateEquipoInput } from 'types/equipo';

const KEY = ['equipos'];

// YA NO NECESITAMOS LA DEFINICIÓN DE CreateEquipoInput AQUÍ, LA BORRAMOS.

export function useEquipos() {
  const qc = useQueryClient();
  

  // --- OBTENER la lista de equipos ---
  // Esta parte ya está perfecta. Llama a GET /api/equipos
  const list = useQuery({
    queryKey: KEY,
    queryFn: () => api.get<Equipo[]>('/equipos'),
  });

  // --- CREAR un nuevo equipo ---
  // ¡MODIFICADO! Esta es la parte que hemos ajustado.
  const create = useMutation({
    // La función ahora espera los datos con el tipo que definimos arriba.
    mutationFn: (data: CreateEquipoInput) =>
      api.post<Equipo>('/equipos', data), // Llama a POST /api/equipos con todos los datos
    
    // Después de crear, invalida la lista para que se actualice sola.
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  // --- ACTUALIZAR un equipo existente ---
  // No necesita cambios, está perfecto. Llama a PUT /api/equipos/:id
  const update = useMutation({
    mutationFn: (p: { id: number; data: Partial<Pick<Equipo, 'nombre' | 'ciudad'>> }) =>
      api.put<Equipo>(`/equipos/${p.id}`, p.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  // --- BORRAR un equipo ---
  // No necesita cambios, está perfecto. Llama a DELETE /api/equipos/:id
  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/equipos/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return { list, create, update, remove };
}