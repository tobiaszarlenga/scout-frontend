"use client";

import { useState } from "react";
import type { Equipo } from "../types";

export default function EquipoForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Partial<Equipo>;
  onSubmit: (values: Omit<Equipo, "id">) => void;
  onCancel: () => void;
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? "");
  const [ciudad, setCiudad] = useState(initial?.ciudad ?? "");
  const [liga, setLiga] = useState(initial?.liga ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError("El nombre es obligatorio");
      return;
    }
    onSubmit({ nombre: nombre.trim(), ciudad: ciudad.trim() || undefined, liga: liga.trim() || undefined });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label className="text-sm text-slate-600">Nombre *</label>
        <input
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Ej: Tucumán Sox"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-600">Ciudad</label>
        <input
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Ej: San Miguel de Tucumán"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-slate-600">Liga</label>
        <input
          value={liga}
          onChange={(e) => setLiga(e.target.value)}
          className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400"
          placeholder="Ej: Litoral"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Guardar
        </button>
      </div>
    </form>
  );
}
