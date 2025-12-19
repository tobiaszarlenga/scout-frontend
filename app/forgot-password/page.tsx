"use client";

import React, { useState } from 'react';
import { api } from '@/lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('Si el email existe, se generó un link de recuperación. Revisa la consola del backend.');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error solicitando recuperación';
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-bg text-apptext p-6 flex items-center justify-center">
      <div className="w-full max-w-md bg-card border border-appborder rounded-md p-6">
        <h1 className="text-xl font-semibold mb-3">Recuperar contraseña</h1>
        <p className="text-sm text-muted mb-4">Ingresa tu email y te mostraremos un enlace de recuperación en la consola del servidor.</p>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-md px-3 py-2 bg-[rgba(255,255,255,0.06)] text-apptext border border-appborder"
          />
          <button type="submit" disabled={loading} className="px-4 py-2 rounded-md bg-accent text-[var(--color-on-accent)]">
            {loading ? 'Generando…' : 'Enviar enlace'}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-muted">{message}</p>}
      </div>
    </main>
  );
}
