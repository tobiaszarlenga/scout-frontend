// hooks/useAuth.ts
"use client";

import { useMutation } from '@tanstack/react-query';
import { api } from 'lib/api';
import { useAuth } from 'context/AuthContext';

// 1. Definimos el tipo de datos que necesitará la función de login
type LoginCredentials = {
  email: string;
  password: string;
};

// 2. Creamos nuestro hook personalizado
export function useLogin() {
  // Obtenemos la función 'login' de nuestro AuthContext.
  // Esta es la función que recargará la página para actualizar la sesión.
  const { login } = useAuth();

  // 3. Usamos useMutation de React Query para manejar la llamada a la API
  const loginMutation = useMutation({
    // La función que se ejecutará, recibe las credenciales y llama a la API
    mutationFn: (credentials: LoginCredentials) =>
      api.post('/auth/login', credentials),

    // 4. ¿Qué hacer cuando la API responde con éxito?
    onSuccess: () => {
      // Llamamos a la función 'login' del contexto. Esto refrescará el estado de la sesión.
      login();
    },
    // onError se maneja automáticamente y podemos leer el error desde la mutación.
  });

  return loginMutation;
}