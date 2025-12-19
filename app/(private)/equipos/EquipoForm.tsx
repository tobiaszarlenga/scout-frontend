// EquipoForm.tsx
"use client";

import { useState } from "react";
import Button from "@/app/components/Button";


// El tipo de datos que este formulario maneja y devuelve
type EquipoFormData = {
  nombre: string;
  ciudad: string | null;
};

type Props = {
  initial?: Partial<EquipoFormData>;
  // La función onSubmit ahora solo espera 'nombre' y 'ciudad'
  onSubmit: (values: EquipoFormData) => Promise<void> | void;
  onCancel: () => void;
};

export default function EquipoForm({ initial, onSubmit, onCancel }: Props) {
  // Ya no necesitamos 'useAuth' aquí
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [ciudad, setCiudad] = useState(initial?.ciudad ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nombreTrim = nombre.trim();
    const ciudadTrim = ciudad?.trim() ?? "";

    if (nombreTrim.length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      // --- ¡AQUÍ ESTÁ EL CAMBIO! ---
      // Creamos el objeto de datos SIN el autorId.
      const valuesToSubmit: EquipoFormData = {
        nombre: nombreTrim,
        ciudad: ciudadTrim || null,
      };

      // Le pasamos los datos limpios al componente padre (NewEquipoModal)
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
        <label className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>Nombre *</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="mt-1 w-full rounded-md px-3 py-2 outline-none"
          placeholder="Ej: Tigres U18"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        />
      </div>

      <div>
        <label className="block text-sm font-medium" style={{ color: 'var(--color-text)' }}>Ciudad</label>
        <input
          type="text"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="mt-1 w-full rounded-md px-3 py-2 outline-none"
          placeholder="Opcional"
          style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        />
      </div>

      {error && <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-3 py-2 disabled:opacity-50"
          disabled={submitting}
          style={{ backgroundColor: 'rgba(var(--color-text-rgb),0.04)', color: 'var(--color-text)', border: '1px solid var(--color-border)' }}
        >
          Cancelar
        </button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? "Guardando..." : "Guardar"}
        </Button>

      </div>

      <p className="text-xs" style={{ color: 'var(--color-muted)' }}>* El nombre debe ser único.</p>
    </form>
  );
}