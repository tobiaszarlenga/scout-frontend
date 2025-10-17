// app/register/page.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import styles from '../login/LoginPage.module.css';
import { useAuth } from '@/context/AuthContext'; // 1. Importamos el hook useAuth

export default function RegisterPage() {
  const { login } = useAuth(); // 2. Obtenemos la función login del contexto
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        // 3. ¡AQUÍ ESTÁ EL CAMBIO!
        // En lugar de redirigir al login, llamamos a la función 'login'.
        // Esta función se encargará de actualizar el estado del usuario y redirigir
        // a la página principal de la aplicación.
        await login(); 
      } else {
        setError(data.error || 'Ocurrió un error en el registro.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    }
  };

  return (
    <div className={styles.mainContainer}>
      <div className={styles.formulario}>
        <h1>Crear Cuenta</h1>
        <form onSubmit={handleSubmit}>
          
          <div className={styles.username}>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder=" " autoComplete="name" />
            <span></span>
            <label>Nombre y Apellido</label>
          </div>

          <div className={styles.username}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder=" " autoComplete="email" />
            <span></span>
            <label>Email</label>
          </div>

          <div className={styles.username}>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder=" " autoComplete="new-password" />
            <span></span>
            <label>Contraseña</label>
          </div>

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