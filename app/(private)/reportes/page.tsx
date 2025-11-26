"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { usePartidos } from "@/hooks/usePartidos";
import { usePitchers } from "@/hooks/usePitchers";
import { useEquipos } from "@/hooks/useEquipos";
import { useLanzamientos } from "@/hooks/useLanzamientos";
import Link from "next/link";

type Mode = "recent" | "match" | "pitcher" | "team";

export default function ReportesPage() {
  const { list: partidosQuery } = usePartidos();
  const { list: pitchersQuery } = usePitchers();
  const { list: equiposQuery } = useEquipos();

  const partidos = useMemo(() => partidosQuery.data ?? [], [partidosQuery.data]);
  const pitchers = useMemo(() => pitchersQuery.data ?? [], [pitchersQuery.data]);
  const equipos = useMemo(() => equiposQuery.data ?? [], [equiposQuery.data]);

  const [mode, setMode] = useState<Mode>("recent");
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [selectedPitcherId, setSelectedPitcherId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);

  const matchLanzamientos = useLanzamientos(selectedMatchId ?? -1);

  const recentMatch = useMemo(() => {
    if (!partidos || partidos.length === 0) return null;
    return partidos
      .slice()
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())[0];
  }, [partidos]);

  const matchesForPitcher = useMemo(() => {
    if (!selectedPitcherId) return [];
    return partidos.filter(
      (p) =>
        p.pitcherLocalId === selectedPitcherId ||
        p.pitcherVisitanteId === selectedPitcherId
    );
  }, [partidos, selectedPitcherId]);

  const matchesForTeam = useMemo(() => {
    if (!selectedTeamId) return [];
    return partidos.filter(
      (p) =>
        p.equipoLocalId === selectedTeamId ||
        p.equipoVisitanteId === selectedTeamId
    );
  }, [partidos, selectedTeamId]);

  // (previously used for client-side aggregation; replaced by server endpoints)

  // Flechita del select ▼
  const Chevron = () => (
    <svg
      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="var(--color-text)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  // Labels map
  const MODE_LABELS: Record<Mode, string> = {
    recent: "Último Partido",
    match: "Por Partido",
    pitcher: "Por Pitcher",
    team: "Por Equipo",
  };

  // Polished filter menu with outside-click and Esc-to-close
  const FilterMenu = ({ onSelect }: { onSelect?: (m: Mode) => void }) => {
    const items: { key: Mode; label: string }[] = [
      { key: "recent", label: MODE_LABELS.recent },
      { key: "match", label: MODE_LABELS.match },
      { key: "pitcher", label: MODE_LABELS.pitcher },
      { key: "team", label: MODE_LABELS.team },
    ];

    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
      function onDoc(e: MouseEvent) {
        if (!ref.current) return;
        if (!ref.current.contains(e.target as Node)) setOpen(false);
      }
      function onKey(e: KeyboardEvent) {
        if (e.key === "Escape") setOpen(false);
      }
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDoc);
        document.removeEventListener("keydown", onKey);
      };
    }, []);

    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen((s) => !s)}
          className="flex items-center gap-2 px-3 py-2 rounded-md"
          style={{
            backgroundColor: 'var(--color-card)',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
            cursor: 'pointer'
          }}
          aria-haspopup="listbox"
          aria-expanded={open}
          type="button"
          title="Abrir filtros"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 9l6 6 6-6" stroke="var(--color-text)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        <div
          className={`absolute right-0 z-20 mt-2 w-56 rounded-lg overflow-hidden transform origin-top-right transition-all duration-150 ${
            open ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
          }`}
          style={{ backgroundColor: 'var(--color-card)', border: '1px solid var(--color-border)' }}
          role="listbox"
          aria-hidden={!open}
        >
          {items.map((it) => (
            <button
              key={it.key}
              onClick={() => {
                setMode(it.key);
                setOpen(false);
                if (onSelect) onSelect(it.key);
              }}
              className="w-full text-left px-4 py-2 hover:bg-[rgba(0,0,0,0.04)] transition-colors"
              style={{
                backgroundColor: mode === it.key ? 'var(--color-accent)' : 'transparent',
                color: mode === it.key ? '#fff' : 'var(--color-text)',
                cursor: 'pointer'
              }}
              role="option"
              aria-selected={mode === it.key}
              type="button"
            >
              {it.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <main
      className="min-h-full w-full max-w-full overflow-x-hidden px-6 py-6 sm:px-10 sm:py-8"
      style={{
        backgroundColor: 'var(--color-bg)',
        color: 'var(--color-text)',
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between pb-6">
          <h1 className="text-4xl font-bold" style={{ color: 'var(--color-text)' }}>
            Reportes
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Filtros */}
          <aside
            className="col-span-1 p-4 rounded-2xl shadow-md self-start"
            style={{ backgroundColor: 'var(--color-card)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold" style={{ color: 'var(--color-text)' }}>Filtros</h3>
                {mode && (
                  <div className="mt-1 text-sm" style={{ color: 'var(--color-text)' }}>
                    {MODE_LABELS[mode]}
                  </div>
                )}
              </div>

              <FilterMenu />
            </div>

            {/* Selects dinámicos con flecha y cursor */}
            {mode === "match" && (
              <div className="mt-4">
                <label className="text-sm font-medium">Seleccionar Partido</label>
                <div className="relative mt-2">
                  <select
                    className="w-full p-2 rounded-lg border border-gray-700 focus:outline-none pr-10"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text)',
                      appearance: "none",
                      cursor: "pointer",
                    }}
                    value={String(selectedMatchId ?? "")}
                    onChange={(e) =>
                      setSelectedMatchId(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value=""> Elegir </option>
                    {partidos.map((p) => (
                      <option
                        key={p.id}
                        value={p.id}
                        style={{
                          backgroundColor: 'var(--color-card)',
                          color: 'var(--color-text)',
                          cursor: "pointer",
                        }}
                      >
                        {p.equipoLocal.nombre} vs {p.equipoVisitante.nombre} -{" "}
                        {new Date(p.fecha).toLocaleString()}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>
            )}

            {mode === "pitcher" && (
              <div className="mt-4">
                <label className="text-sm font-medium">Seleccionar Pitcher</label>
                <div className="relative mt-2">
                  <select
                    className="w-full p-2 rounded-lg border border-gray-700 focus:outline-none pr-10"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text)',
                      appearance: "none",
                      cursor: "pointer",
                    }}
                    value={String(selectedPitcherId ?? "")}
                    onChange={(e) =>
                      setSelectedPitcherId(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value="">Elegir</option>
                    {pitchers.map((pt) => (
                      <option
                        key={pt.id}
                        value={pt.id}
                        style={{
                          backgroundColor: 'var(--color-card)',
                          color: 'var(--color-text)',
                          cursor: "pointer",
                        }}
                      >
                        {pt.nombre} {pt.apellido}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>
            )}

            {mode === "team" && (
              <div className="mt-4">
                <label className="text-sm font-medium">Seleccionar Equipo</label>
                <div className="relative mt-2">
                  <select
                    className="w-full p-2 rounded-lg border border-gray-700 focus:outline-none pr-10"
                    style={{
                      backgroundColor: 'var(--color-card)',
                      color: 'var(--color-text)',
                      appearance: "none",
                      cursor: "pointer",
                    }}
                    value={String(selectedTeamId ?? "")}
                    onChange={(e) =>
                      setSelectedTeamId(e.target.value ? Number(e.target.value) : null)
                    }
                  >
                    <option value=""> Elegir </option>
                    {equipos.map((eq) => (
                      <option
                        key={eq.id}
                        value={eq.id}
                        style={{
                          backgroundColor: 'var(--color-card)',
                          color: 'var(--color-text)',
                          cursor: "pointer",
                        }}
                      >
                        {eq.nombre}
                      </option>
                    ))}
                  </select>
                  <Chevron />
                </div>
              </div>
            )}
          </aside>

          {/* Contenido principal */}
          <section className="col-span-3">
            <div
              className="p-5 rounded-2xl shadow-md mb-4"
              style={{ backgroundColor: 'var(--color-card)' }}
            >
              <h2 className="font-semibold text-lg mb-2">Resumen rápido</h2>

              {mode === "recent" && recentMatch && (
                <div className="mt-3 flex justify-between items-center">
                  <div>
                    <div className="text-lg font-medium">
                      {recentMatch.equipoLocal.nombre} vs{" "}
                      {recentMatch.equipoVisitante.nombre}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(recentMatch.fecha).toLocaleString()}
                    </div>
                  </div>
                  <Link
                    href={`/reportes/${recentMatch.id}`}
                    className="px-4 py-2 rounded-lg font-medium transition"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: "#fff",
                      cursor: "pointer",
                    }}
                  >
                    Ver reporte detallado
                  </Link>
                </div>
              )}

              {mode === "match" && selectedMatchId && (
                <div className="mt-3">
                  <h3 className="font-medium">Partido seleccionado</h3>
                  <Link
                    href={`/reportes/${selectedMatchId}`}
                    className="block mt-3 px-4 py-2 rounded-lg font-medium text-center transition"
                    role="button"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: '#fff',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                  >
                    Abrir reporte detallado
                  </Link>
                  {matchLanzamientos.list.isLoading && (
                    <p className="text-gray-400 mt-2">Cargando lanzamientos...</p>
                  )}
                  {matchLanzamientos.list.isSuccess && (
                    <div className="text-sm mt-2">
                      Lanzamientos: {matchLanzamientos.list.data.length}
                    </div>
                  )}
                </div>
              )}

              {mode === "pitcher" && selectedPitcherId && (
                <div className="mt-3">
                  <h3 className="font-medium mb-2">Partidos del Pitcher</h3>
                  <ul className="space-y-2">
                    {matchesForPitcher.map((m) => (
                      <li
                        key={m.id}
                        className="flex justify-between items-center border border-gray-700 p-2 rounded-lg"
                      >
                        <div>
                          {m.equipoLocal.nombre} vs {m.equipoVisitante.nombre} —{" "}
                          {new Date(m.fecha).toLocaleString()}
                        </div>
                        <Link
                          href={`/reportes/${m.id}`}
                          style={{ color: 'var(--color-accent)', cursor: "pointer" }}
                        >
                          Ver
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/reportes/pitcher/${selectedPitcherId}`}
                    className="mt-4 inline-block px-3 py-2 rounded-lg font-medium transition text-center"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: '#fff',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                  >
                    Ver estadísticas históricas
                  </Link>
                </div>
              )}

              {mode === "team" && selectedTeamId && (
                <div className="mt-3">
                  <h3 className="font-medium mb-2">Partidos del Equipo</h3>
                  <ul className="space-y-2">
                    {matchesForTeam.map((m) => (
                      <li
                        key={m.id}
                        className="flex justify-between items-center border border-gray-700 p-2 rounded-lg"
                      >
                        <div>
                          {m.equipoLocal.nombre} vs {m.equipoVisitante.nombre} —{" "}
                          {new Date(m.fecha).toLocaleString()}
                        </div>
                        <Link
                          href={`/reportes/${m.id}`}
                          style={{ color: 'var(--color-accent)', cursor: "pointer" }}
                        >
                          Ver
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/reportes/equipo/${selectedTeamId}`}
                    className="mt-4 inline-block px-3 py-2 rounded-lg font-medium transition text-center"
                    style={{
                      backgroundColor: 'var(--color-accent)',
                      color: '#fff',
                      cursor: 'pointer',
                      textDecoration: 'none',
                    }}
                  >
                    Ver estadísticas históricas
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
