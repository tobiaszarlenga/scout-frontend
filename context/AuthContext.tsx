// context/AuthContext.tsx
"use client";

import { createContext, useState, useContext, useEffect, type ReactNode } from "react";
import { api } from "lib/api"; // Nuestro wrapper de fetch

// Definimos la "forma" de un usuario y del contexto
type User = {
  id: number;
  name: string;
  email: string;
  rol: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
 login: () => void;
  logout: () => void;
};

// Creamos el contexto con un valor inicial por defecto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Creamos el "Proveedor" del contexto. Este componente envolverá nuestra app.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Efecto para verificar si hay una sesión activa al cargar la app
  useEffect(() => {
    async function checkUserSession() {
      try {
        // Hacemos una petición al endpoint 'me' que nos devuelve el usuario si la cookie es válida
        const userData = await api.get<User>('/auth/me');
        if (userData) {
          setUser(userData);
        }
      } catch (error) {
        // Si hay un error (ej. token inválido o expirado), nos aseguramos de que no haya usuario
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkUserSession();
  }, []);

  const login = async () => {
    // Al hacer login exitoso, el backend ya guardó la cookie
    // Ahora obtenemos los datos del usuario y redirigimos
    try {
      const userData = await api.get<User>('/auth/me');
      if (userData) {
        setUser(userData);
        // Redirigir al dashboard
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error al obtener usuario después del login:', error);
      // Si falla, recargamos la página
      window.location.reload();
    }
  };

  const logout = async () => {
    // Llama al endpoint de logout del backend (si lo tienes) y limpia el estado local
    // await api.post('/auth/logout'); // Descomentar si tienes un endpoint de logout
    setUser(null);
    window.location.href = '/login'; // Redirige al login
  };

  const value = { user, isLoading, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Creamos un hook personalizado para usar fácilmente el contexto en otros componentes
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}