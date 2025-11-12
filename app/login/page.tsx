// app/login/page.tsx
"use client";

import { useState } from 'react';
import { useLogin } from '../../hooks/useAuth';
// 👇 1. Importamos el archivo de estilos
import styles from './LoginPage.module.css';

export default function LoginPage() {
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

  // 👇 2. Reemplazamos todo el return con la nueva estructura
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
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isPending}
            placeholder=" "
            autoComplete="current-password"
            />
            <span></span>
            <label>Contraseña</label>
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
          </div>

        </form>
      </div>
    </div>
  );
}