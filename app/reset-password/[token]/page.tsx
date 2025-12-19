"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';

export default function ResetPasswordPage() {
  const params = useParams();
  const router = useRouter();
  const token = String(params?.token ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    // Reglas: mínimo 8 caracteres y al menos una mayúscula
    const minLenOk = password.length >= 8;
    const hasUpper = /[A-ZÁÉÍÓÚÑ]/.test(password);
    if (!minLenOk || !hasUpper) {
      setMessage('La contraseña debe tener mínimo 8 caracteres y al menos una letra mayúscula.');
      return;
    }
    if (password !== confirm) {
      setMessage('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setMessage('Contraseña actualizada. Serás redirigido al inicio de sesión…');
      setTimeout(() => router.push('/login'), 1500);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al actualizar la contraseña';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-apptext p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-card border border-appborder rounded-md p-6">
        <h1 className="text-xl font-semibold mb-3">Restablecer contraseña</h1>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nueva contraseña"
            className="w-full rounded-md px-3 py-2 bg-[rgba(255,255,255,0.06)] text-apptext border border-appborder"
          />
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirmar contraseña"
            className="w-full rounded-md px-3 py-2 bg-[rgba(255,255,255,0.06)] text-apptext border border-appborder"
          />
          {message && <p className="text-sm text-muted">{message}</p>}
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-accent text-[var(--color-on-accent)]">
            {loading ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </div>
    </main>
  );
}
