// app/components/UserInfo.tsx
"use client";

import { useAuth } from '@/contexts/AuthContext';

export default function UserInfo() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return null; // No mostrar nada si está cargando o no hay usuario
  }

  return (
    <div className="text-sm">
      Hola, <span className="font-semibold">{user.name || user.email}</span>
    </div>
  );
}