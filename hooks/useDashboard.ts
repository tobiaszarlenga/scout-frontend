import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext'; // --- CAMBIO 1: Ruta relativa correcta ---
import { api } from '../lib/api'; // --- CAMBIO 2: Importamos 'api' desde 'api.ts' ---

// --- 1. Definimos los Tipos de Datos que esperamos del API ---
// (Estas interfaces están bien, no se tocan)
interface DashboardKPIs {
  equipos: number;
  pitchers: number;
  partidos: number;
}

interface GraficoTortaData {
  name: string; // "PROGRAMADO" o "FINALIZADO"
  value: number;
}

interface GraficoBarrasData {
  name: string; // Nombre del equipo
  pitchers: number;
}

interface ProximoPartido {
  id: number;
  fecha: string; // Viene como string ISO
  equipoLocal: string;
  equipoVisitante: string;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  graficoTorta: GraficoTortaData[];
  graficoBarras: GraficoBarrasData[];
  proximosPartidos: ProximoPartido[];
}

// --- 2. Creamos la función que llama al API ---
// --- CAMBIO 3: Simplificamos la función. No necesita 'token'. ---
// Tu 'api.get' ya está configurado para enviar la cookie de autenticación.
const fetchDashboardData = async (): Promise<DashboardData> => {
  const data = await api.get<DashboardData>('/dashboard');
  return data;
};


// --- 3. Creamos el Hook ---
// --- CAMBIO 4: Usamos 'user' e 'isLoading' del 'useAuth' ---
export const useDashboard = () => {
  const { user, isLoading } = useAuth(); // Obtenemos el usuario y el estado de carga

  const dashboardQuery = useQuery({
    // La 'queryKey' depende del ID del usuario.
    // Si el usuario cambia, la query se vuelve a ejecutar.
    queryKey: ['dashboard', user?.id], 
    
    // Solo ejecuta la query si:
    // 1. La autenticación inicial YA TERMINÓ (!isLoading)
    // 2. HAY un usuario logueado (!!user)
    enabled: !isLoading && !!user, 
    
    // Llama a nuestra función 'fetch' simplificada
    queryFn: fetchDashboardData, // No necesita argumentos
    
    refetchOnWindowFocus: false, 
    staleTime: 1000 * 60 * 5,
  });

  return {
    query: dashboardQuery,
  };
};