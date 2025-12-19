// app/login/page.tsx
"use client";

import { useState } from 'react';
import { useLogin } from '../../hooks/useAuth';
import { Eye, EyeOff } from 'lucide-react';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { mutate: login, isPending, isError } = useLogin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Por favor, completa ambos campos.");
      return;
    }

    // ✅ Validación mínima interna (sin mostrar errores visuales)
    if (password.length < 3) {
      alert("Contraseña demasiado corta.");
      return;
    }

    login({ email, password });
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.formulario}>
        <h1>Inicio de Sesión</h1>

        <form onSubmit={handleSubmit}>
          <div className={styles.username}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isPending}
              placeholder=" "
              autoComplete="email"
            />
            <span></span>
            <label>Email</label>
          </div>

          <div className={styles.username}>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isPending}
              placeholder=" "
              autoComplete="current-password"
            />
            <span></span>
            <label>Contraseña</label>
            <button
              type="button"
              className={styles.togglePasswordBtn}
              onClick={() => setShowPassword(!showPassword)}
              disabled={isPending}
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              style={{ background: 'none', border: 'none', cursor: isPending ? 'not-allowed' : 'pointer', opacity: isPending ? 0.5 : 1 }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
 
          
          {/* Mensaje de error de React TanStack Query */}
          {isError && (
            <p className={styles.errorMessage}>
              Error: Las credenciales son inválidas.
            </p>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isPending}
          >
            {isPending ? "Ingresando..." : "Iniciar"}
          </button>

          <div className={styles.registrarse}>
            Quiero hacer el <a href="/register">registro</a>
            <br />
            <a href="/forgot-password" style={{ color: 'var(--color-muted)' }}>¿Olvidaste tu contraseña?</a>
          </div>
        </form>
      </div>
    </div>
  );
}
