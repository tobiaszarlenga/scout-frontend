// app/components/AuthGuard.tsx
"use client";

import { useEffect, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { redirect } from 'next/navigation';

// Este es nuestro componente guardián
export default function AuthGuard({ children }: { children: ReactNode }) {
  // 1. Obtenemos el estado de la sesión desde nuestro contexto
  const { user, isLoading } = useAuth();

  // 2. Usamos useEffect para redirigir solo en el lado del cliente
  useEffect(() => {
    // Si la sesión ya terminó de cargar y NO hay usuario...
    if (!isLoading && !user) {
      // ...lo redirigimos a la página de login.
      redirect('/login');
    }
  }, [isLoading, user]); // Se ejecuta cada vez que isLoading o user cambian

  // 3. Mientras se verifica la sesión, mostramos un mensaje de carga
  if (isLoading) {
    return <p className="flex min-h-screen items-center justify-center">Cargando sesión...</p>;
  }

  // 4. Si terminó de cargar y SÍ hay un usuario, mostramos el contenido protegido
  if (user) {
    return <>{children}</>;
  }

  // 5. Si no está cargando y no hay usuario, no muestra nada mientras redirige
  return null;
}