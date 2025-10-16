// app/login/page.tsx
"use client";

import { useState } from 'react';
import { useLogin } from '../../hooks/useAuth';

export default function LoginPage() {
  // 👇 1. CAMBIO AQUÍ: Pedimos 'isError' en lugar de 'error'
  const { mutate: login, isPending, isError } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Por favor, completa ambos campos.");
      return;
    }
    login({ email, password });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="tu@email.com"
              disabled={isPending}
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              disabled={isPending}
            />
          </div>
          
          {/* 👇 2. CAMBIO AQUÍ: Comprobamos si 'isError' es verdadero */}
          {isError && (
            <p className="text-sm text-red-600">
              Error: Las credenciales son inválidas.
            </p>
          )}

          <div>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              disabled={isPending}
            >
              {isPending ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}