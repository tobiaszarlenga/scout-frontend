// En: hooks/useLookups.ts

import { useQuery } from '@tanstack/react-query';
import { api } from 'lib/api'; // Usamos el mismo cliente 'api'

// --- 1. Definimos un tipo genérico para estas listas ---
// Ambas rutas devuelven un array de objetos con 'id' y 'nombre'.
interface LookupItem {
  id: number;
  nombre: string;
}

// --- 2. Definimos las llaves (keys) de la caché ---
const TIPOS_KEY = ['tiposLanzamiento'];
const RESULTADOS_KEY = ['resultadosLanzamiento'];

export function useLookups() {
  
  // --- OBTENER Tipos de Lanzamiento ---
  // Llama a: GET /api/lookup/tipos-lanzamiento
  const tipos = useQuery({
    queryKey: TIPOS_KEY,
    queryFn: () => api.get<LookupItem[]>('/lookup/tipos-lanzamiento'),
    // Aseguramos que después de un reset/seed, vuelva a pedir datos
    refetchOnMount: 'always',
    staleTime: 10 * 60 * 1000, // 10 minutos
  });

  // --- OBTENER Resultados de Lanzamiento ---
  // Llama a: GET /api/lookup/resultados-lanzamiento
  const resultados = useQuery({
    queryKey: RESULTADOS_KEY,
    queryFn: () => api.get<LookupItem[]>('/lookup/resultados-lanzamiento'),
    refetchOnMount: 'always',
    staleTime: 10 * 60 * 1000,
  });

  return { tipos, resultados };
}