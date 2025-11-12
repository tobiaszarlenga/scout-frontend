// app/register/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from '../login/LoginPage.module.css';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const { login } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // 🔹 Función de validación
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!/[A-Z]/.test(pwd)) return 'La contraseña debe incluir al menos una letra mayúscula.';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      // 1. Registrar el usuario
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // 2. Hacer login automático con las credenciales del registro
        const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include', // Importante: incluir cookies
          body: JSON.stringify({ email, password }),
        });

        if (loginRes.ok) {
          // 3. Actualizar el estado del contexto y redirigir
          await login();
        } else {
          setError('Registro exitoso, pero hubo un error al iniciar sesión. Por favor, inicia sesión manualmente.');
        }
      } else {
        setError(data.error || 'Ocurrió un error en el registro.');
      }
    } catch {
      setError('No se pudo conectar con el servidor.');
    }
  };

  // 🔹 Validación en vivo (opcional)
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError(validatePassword(value) || '');
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.formulario}>
        <h1>Crear Cuenta</h1>
        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.username}>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder=" "
              autoComplete="name"
            />
            <span></span>
            <label>Nombre y Apellido</label>
          </div>

          <div className={styles.username}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              minLength={8}
              pattern="(?=.*[A-Z]).{8,}"
              title="Debe tener al menos 8 caracteres y una mayúscula."
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              onBlur={() => setError(validatePassword(password) || '')}
              placeholder=" "
              autoComplete="new-password"
            />
            <span></span>
            <label>Contraseña</label>
          </div>

          {/* 🔹 Mensaje de error */}
          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.submitBtn}>
            Registrarse e Ingresar
          </button>

          <div className={styles.registrarse}>
            ¿Ya tienes una cuenta? <Link href="/login">Inicia Sesión</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
