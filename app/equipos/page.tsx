"use client";

import { useMemo, useState } from "react";
import { EQUIPOS_MOCK } from "../mocks/equipos";
import Section from "../components/Section";
import { Plus, Search } from "lucide-react";

export default function EquiposPage() {
  const [q, setQ] = useState("");

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return EQUIPOS_MOCK;
    return EQUIPOS_MOCK.filter(e =>
      [e.nombre, e.ciudad, e.liga].some(v => (v ?? "").toLowerCase().includes(t))
    );
  }, [q]);

  return (
    <div className="space-y-6">
      <Section title="Equipos" description="Gestión y listado de equipos registrados.">
        {/* Toolbar */}
        <div className="mb-3 flex items-center justify-between gap-2">
          <div className="relative w-full max-w-xs">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar equipo..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-slate-400"
            />
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>

          <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800">
            <Plus size={16} />
            Nuevo equipo
          </button>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Ciudad</th>
                <th className="px-4 py-2 text-left">Liga</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((e) => (
                <tr key={e.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-2 font-medium text-slate-800">{e.nombre}</td>
                  <td className="px-4 py-2">{e.ciudad ?? "-"}</td>
                  <td className="px-4 py-2">{e.liga ?? "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}
