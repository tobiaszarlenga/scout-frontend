// app/components/AccessDeniedMessage.tsx
"use client";

import { useRouter } from 'next/navigation';

export function AccessDeniedMessage() { // 👈 Asegúrate de que "default" esté aquí
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Acceso Restringido</h2>
      <p className="mb-6 text-gray-600">
        Necesitas iniciar sesión para poder ver esta página.
      </p>
      <button
        onClick={() => router.push('/login')}
        className="rounded-md bg-blue-600 px-4 py-2 text-white font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        Ir a Iniciar Sesión
      </button>
    </div>
  );
}