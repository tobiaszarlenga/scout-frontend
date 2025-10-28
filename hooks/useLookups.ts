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
    
    // --- Optimización ---
    // Estas listas casi nunca cambian.
    // 'staleTime: Infinity' le dice a React Query:
    // "Carga esto 1 vez, y NUNCA lo vuelvas a pedir"
    // (hasta que el usuario cierre y vuelva a abrir la app).
    staleTime: Infinity,
    gcTime: Infinity,
  });

  // --- OBTENER Resultados de Lanzamiento ---
  // Llama a: GET /api/lookup/resultados-lanzamiento
  const resultados = useQuery({
    queryKey: RESULTADOS_KEY,
    queryFn: () => api.get<LookupItem[]>('/lookup/resultados-lanzamiento'),
    
    // Misma optimización
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return { tipos, resultados };
}