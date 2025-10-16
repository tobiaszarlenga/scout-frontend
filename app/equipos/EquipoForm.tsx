// EquipoForm.tsx
"use client";

import { useState } from "react";
// ¡MODIFICADO! Importamos el tipo que espera nuestra mutación del hook.

import { useAuth } from "@/context/AuthContext"; // 👈 1. Importa el hook de autenticación
import type { CreateEquipoInput } from "@/types/equipo"; // 👈 2. Importa el tipo correcto

type Props = {
  initial?: Partial<CreateEquipoInput>;
  // ¡MODIFICADO! La función onSubmit ahora espera recibir el objeto completo, incluyendo autorId.
  onSubmit: (values: CreateEquipoInput) => Promise<void> | void;
  onCancel: () => void;
};

export default function EquipoForm({ initial, onSubmit, onCancel }: Props) {
  const { user } = useAuth(); // 👈 2. Obtén el usuario del contexto
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [ciudad, setCiudad] = useState(initial?.ciudad ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Validaciones simples del lado del cliente
       if (!user) {
      setError("No se ha podido identificar al usuario. Por favor, inicia sesión de nuevo.");
      return;
    }


    const nombreTrim = nombre.trim();
    const ciudadTrim = ciudad?.trim() ?? "";

    if (nombreTrim.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // --- ¡AQUÍ ESTÁ LA MAGIA! ---
      // Creamos el objeto de datos y añadimos nuestro autorId "hardcodeado".
      const valuesToSubmit: CreateEquipoInput = {
        nombre: nombreTrim,
        ciudad: ciudadTrim || null, // Usamos null para consistencia con la DB
        autorId: user.id, // 👈 3. Añadimos el ID del usuario autenticado
      };

      await onSubmit(valuesToSubmit);

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ocurrió un error.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  // El resto del JSX (la parte visual del formulario) no necesita ningún cambio.
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nombre *</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
          placeholder="Ej: Tigres U18"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Ciudad</label>
        <input
          type="text"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring"
          placeholder="Opcional"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
          disabled={submitting}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-md bg-green-600 px-3 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          disabled={submitting}
        >
          {submitting ? "Guardando..." : "Guardar"}
        </button>
      </div>

      <p className="text-xs text-gray-500">* El nombre debe ser único.</p>
    </form>
  );
}