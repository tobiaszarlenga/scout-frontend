"use client";

import React, { useMemo, useState } from "react";
import { usePartidos } from "@/hooks/usePartidos";
import { usePitchers } from "@/hooks/usePitchers";
import { useEquipos } from "@/hooks/useEquipos";
import { useLanzamientos } from "@/hooks/useLanzamientos";
import { lanzamientosApi } from "@/lib/api";
import Link from "next/link";

const COLORS = {
  bgFrom: "#1F2F40",
  bgTo: "#15202B",
  card: "#22313F",
  text: "#DDE2E5",
  accent: "#E04E0E",
  edit: "#3B82F6",
};

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

  const aggregateForMatches = async (matchIds: number[]) => {
    const promises = matchIds.map((id) => lanzamientosApi.listByPartido(id));
    const results = await Promise.all(promises);
    const all = results.flat();
    const total = all.length;
    const velocidades = all
      .map((x) => x.velocidad)
      .filter((v) => typeof v === "number") as number[];
    const avgVel = velocidades.length
      ? velocidades.reduce((a, b) => a + b, 0) / velocidades.length
      : null;
    const zoneCounts = new Array<number>(25).fill(0);
    all.forEach((l) => {
      if (typeof l.x === "number" && typeof l.y === "number") {
        const idx = l.y * 5 + l.x;
        if (idx >= 0 && idx < 25) zoneCounts[idx]++;
      }
    });
    return { total, avgVel, zoneCounts };
  };

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
        stroke={COLORS.text}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <main
      className="min-h-full w-full max-w-full overflow-x-hidden px-6 py-6 sm:px-10 sm:py-8"
      style={{
        background: `linear-gradient(135deg, ${COLORS.bgFrom}, ${COLORS.bgTo})`,
        color: COLORS.text,
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        <header className="flex items-center justify-between pb-6">
          <h1 className="text-4xl font-bold" style={{ color: COLORS.text }}>
            Reportes
          </h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar Filtros */}
          <aside
            className="col-span-1 p-4 rounded-2xl shadow-md"
            style={{ backgroundColor: COLORS.card }}
          >
            <h3 className="font-semibold mb-3" style={{ color: COLORS.text }}>
              Filtros
            </h3>
            <div className="space-y-2">
              {[
                { key: "recent", label: "Último Partido" },
                { key: "match", label: "Por Partido" },
                { key: "pitcher", label: "Por Pitcher" },
                { key: "team", label: "Por Equipo" },
              ].map((item) => (
                <button
                  key={item.key}
                  onClick={() => setMode(item.key as Mode)}
                  className="w-full text-left px-3 py-2 rounded-lg transition font-medium"
                  style={{
                    backgroundColor: mode === item.key ? COLORS.accent : "transparent",
                    color: mode === item.key ? "#fff" : COLORS.text,
                    cursor: "pointer",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Selects dinámicos con flecha y cursor */}
            {mode === "match" && (
              <div className="mt-4">
                <label className="text-sm font-medium">Seleccionar Partido</label>
                <div className="relative mt-2">
                  <select
                    className="w-full p-2 rounded-lg border border-gray-700 focus:outline-none pr-10"
                    style={{
                      backgroundColor: COLORS.card,
                      color: COLORS.text,
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
                          backgroundColor: COLORS.card,
                          color: COLORS.text,
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
                      backgroundColor: COLORS.card,
                      color: COLORS.text,
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
                          backgroundColor: COLORS.card,
                          color: COLORS.text,
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
                      backgroundColor: COLORS.card,
                      color: COLORS.text,
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
                          backgroundColor: COLORS.card,
                          color: COLORS.text,
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
              style={{ backgroundColor: COLORS.card }}
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
                      backgroundColor: COLORS.accent,
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
                    className="block mt-2"
                    style={{ color: COLORS.accent, cursor: "pointer" }}
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
                          style={{ color: COLORS.accent, cursor: "pointer" }}
                        >
                          Ver
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-4 px-3 py-2 rounded-lg font-medium transition"
                    style={{
                      backgroundColor: COLORS.accent,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      const ids = matchesForPitcher.map((m) => m.id);
                      if (ids.length === 0) return alert("No hay partidos");
                      const agg = await aggregateForMatches(ids);
                      alert(
                        `Total: ${agg.total}\nAvg Vel: ${
                          agg.avgVel ? agg.avgVel.toFixed(1) : "N/A"
                        }`
                      );
                    }}
                  >
                    Ver estadísticas agregadas
                  </button>
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
                          style={{ color: COLORS.accent, cursor: "pointer" }}
                        >
                          Ver
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="mt-4 px-3 py-2 rounded-lg font-medium transition"
                    style={{
                      backgroundColor: COLORS.accent,
                      color: "#fff",
                      cursor: "pointer",
                    }}
                    onClick={async () => {
                      const ids = matchesForTeam.map((m) => m.id);
                      if (ids.length === 0) return alert("No hay partidos");
                      const agg = await aggregateForMatches(ids);
                      alert(
                        `Total: ${agg.total}\nAvg Vel: ${
                          agg.avgVel ? agg.avgVel.toFixed(1) : "N/A"
                        }`
                      );
                    }}
                  >
                    Ver estadísticas agregadas
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
