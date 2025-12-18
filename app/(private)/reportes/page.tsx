"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { usePartidos } from "@/hooks/usePartidos";
import { usePitchers } from "@/hooks/usePitchers";
import { useEquipos } from "@/hooks/useEquipos";
import { useLanzamientos } from "@/hooks/useLanzamientos";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, BarChart2 } from 'lucide-react';

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

  const STORAGE_KEY = "reportes.filters.v1";
  const router = useRouter();

  // Load persisted filters from URL query params first, fallback to localStorage
  useEffect(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const hasQuery = sp.has("mode") || sp.has("selectedMatchId") || sp.has("selectedPitcherId") || sp.has("selectedTeamId");

      if (hasQuery) {
        const qMode = sp.get("mode");
        if (qMode) setMode(qMode as Mode);
        const qMatch = sp.get("selectedMatchId");
        setSelectedMatchId(qMatch ? Number(qMatch) : null);
        const qPitcher = sp.get("selectedPitcherId");
        setSelectedPitcherId(qPitcher ? Number(qPitcher) : null);
        const qTeam = sp.get("selectedTeamId");
        setSelectedTeamId(qTeam ? Number(qTeam) : null);
        return;
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        if ("mode" in parsed && parsed.mode) setMode(parsed.mode as Mode);
        setSelectedMatchId(parsed.selectedMatchId ?? null);
        setSelectedPitcherId(parsed.selectedPitcherId ?? null);
        setSelectedTeamId(parsed.selectedTeamId ?? null);
      }
    } catch (e) {
      // ignore parse errors
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist filters whenever they change
  useEffect(() => {
    try {
      const payload = {
        mode,
        selectedMatchId,
        selectedPitcherId,
        selectedTeamId,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore storage errors
    }
  }, [mode, selectedMatchId, selectedPitcherId, selectedTeamId]);

  // Helper to immediately persist current filters (useful to call before navigation)
  const saveFilters = () => {
    try {
      const payload = { mode, selectedMatchId, selectedPitcherId, selectedTeamId };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      // ignore
    }
  };

  // Also update URL query params so browser back/forward preserves filters
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      params.set("mode", mode);
      if (selectedMatchId != null) params.set("selectedMatchId", String(selectedMatchId)); else params.delete("selectedMatchId");
      if (selectedPitcherId != null) params.set("selectedPitcherId", String(selectedPitcherId)); else params.delete("selectedPitcherId");
      if (selectedTeamId != null) params.set("selectedTeamId", String(selectedTeamId)); else params.delete("selectedTeamId");

      const qs = params.toString();
      const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
      router.replace(url);
    } catch (e) {
      // ignore
    }
  }, [mode, selectedMatchId, selectedPitcherId, selectedTeamId, router]);

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
                    onClick={() => saveFilters()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-medium transition shadow-md"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-accent), rgba(199,67,13,0.95))',
                      color: '#fff',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.18)',
                      cursor: 'pointer',
                    }}
                    title="Ver reporte detallado"
                  >
                    <FileText size={16} />
                    <span>Ver reporte detallado</span>
                  </Link>
                </div>
              )}

              {mode === "match" && selectedMatchId && (
                <div className="mt-3">
                  <h3 className="font-medium">Partido seleccionado</h3>
                  <Link
                    href={`/reportes/${selectedMatchId}`}
                    onClick={() => saveFilters()}
                    className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-md font-medium transition shadow-sm"
                    role="button"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-accent), rgba(199,67,13,0.95))',
                      color: '#fff',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                    }}
                  >
                    <FileText size={16} />
                    <span>Abrir reporte detallado</span>
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
                        <Link href={`/reportes/${m.id}`} onClick={() => saveFilters()} title="Ver" className="rounded-full bg-blue-100 p-2 text-blue-600 hover:bg-blue-200">
                          <FileText size={14} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/reportes/pitcher/${selectedPitcherId}`}
                    onClick={() => saveFilters()}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-md font-medium transition shadow-sm"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-accent), rgba(199,67,13,0.95))',
                      color: '#fff',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                    }}
                  >
                    <BarChart2 size={16} />
                    <span>Ver estadísticas históricas</span>
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
                        <Link href={`/reportes/${m.id}`} onClick={() => saveFilters()} title="Ver" className="rounded-full bg-blue-100 p-2 text-blue-600 hover:bg-blue-200">
                          <FileText size={14} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/reportes/equipo/${selectedTeamId}`}
                    onClick={() => saveFilters()}
                    className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-md font-medium transition shadow-sm"
                    style={{
                      background: 'linear-gradient(90deg, var(--color-accent), rgba(199,67,13,0.95))',
                      color: '#fff',
                      cursor: 'pointer',
                      textDecoration: 'none',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.12)'
                    }}
                  >
                    <BarChart2 size={16} />
                    <span>Ver estadísticas históricas</span>
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
