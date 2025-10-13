// contexts/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api'; // Usamos el cliente 'api' que ya configuramos
import { useRouter } from 'next/navigation';

// Definimos los tipos para el usuario y el contexto
interface User {
  id: number;
  email: string;
  name: string | null;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Creamos el Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Creamos el Proveedor del Contexto
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Al cargar la app, verificamos si hay una sesión activa
    const checkUser = async () => {
      try {
        const currentUser = await api.get<User>('/auth/me');
        setUser(currentUser.data);
      } catch (error) {
        setUser(null); // No hay sesión activa
      } finally {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post<User>('/auth/login', { email, password });
      setUser(response.data);
      router.push('/equipos'); // Redirige a una página protegida tras el login
    } catch (error) {
      // Lanzamos el error para que el formulario lo pueda manejar
      throw new Error('Credenciales inválidas');
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
      router.push('/login'); // Redirige a la página de login
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar el contexto fácilmente
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}