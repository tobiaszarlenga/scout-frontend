// app/components/ProtectedRoute.tsx
"use client";

import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AccessDeniedMessage } from './AccessDeniedMessage'; // 👈 1. Importamos el nuevo componente

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Mientras se verifica la sesión, mostramos un mensaje de carga.
  if (isLoading) {
    return <p>Cargando...</p>;
  }

  // Si está autenticado, mostramos el contenido de la página.
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // 👇 2. Si NO está autenticado, mostramos nuestro mensaje personalizado.
  return <AccessDeniedMessage />;
}