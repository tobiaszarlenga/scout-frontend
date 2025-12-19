"use client";

import React from "react";
import PartidosProgramados from "./PartidosProgramados";
import PartidosFinalizados from "./PartidosFinalizados";
import NewPartidoModal from "./NewPartidoModal";
import { usePartidos } from "hooks/usePartidos";

/** Tema coherente con Inicio (usa variables globales) */
const THEME = {
  bgFrom: "var(--color-bg)",
  bgTo: "var(--color-bg)",
  surfaceAlt: "var(--color-card)",
  border: "var(--color-border)",
  text: "var(--color-text)",
  muted: "#9aa7b1",
};

const Card: React.FC<React.PropsWithChildren<{ style?: React.CSSProperties }>> = ({ children, style }) => (
  <div
    style={{
      background: THEME.surfaceAlt,
      border: `1px solid ${THEME.border}`,
      borderRadius: 4,
      padding: "28px 24px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
      transition: "all 0.25s ease",
      ...style,
    }}
    className="hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)] hover:scale-[1.01]"
  >
    {children}
  </div>
);

const Separator = () => (
  <div style={{ margin: "24px 0 48px", height: 1, width: "100%", background: THEME.border }} />
);

export default function PartidosPage() {
  const { list } = usePartidos();
  const programados = (list.data?.filter((p) => p.estado === "PROGRAMADO") ?? []).sort(
    (a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );
  const finalizados = (list.data?.filter((p) => p.estado === "FINALIZADO") ?? []).sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `linear-gradient(160deg, ${THEME.bgFrom}, ${THEME.bgTo})`,
        padding: "40px",
      }}
    >
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 32,
            borderBottom: `1px solid ${THEME.border}`,
            paddingBottom: 8,
          }}
        >
          <div>
            <h1 style={{ color: THEME.text, fontSize: 28, fontWeight: 600, letterSpacing: -0.3 }}>
              Partidos
            </h1>
            <p style={{ color: THEME.text, fontSize: 14, marginTop: 4 }}>
              Gestiona y monitorea tus partidos de softball
            </p>
          </div>
          <NewPartidoModal />
        </header>

        {/* Partidos Programados */}
        <Card>
          <h2
            style={{
              color: THEME.text,
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
              borderBottom: `1px solid ${THEME.border}`,
              paddingBottom: 8,
            }}
          >
            Partidos Programados
          </h2>

          {list.isPending && <p style={{ color: THEME.muted }}>Cargando partidos...</p>}
          {list.isError && (
            <p style={{ color: "#f87171" }}>Error al cargar partidos: {list.error.message}</p>
          )}
          {list.isSuccess && <PartidosProgramados partidos={programados} />}
        </Card>

        {/* Separación clara entre secciones */}
        <Separator />

        {/* Partidos Finalizados */}
        <Card>
          <h2
            style={{
              color: THEME.text,
              fontSize: 18,
              fontWeight: 600,
              marginBottom: 16,
              borderBottom: `1px solid ${THEME.border}`,
              paddingBottom: 8,
            }}
          >
            Partidos Finalizados
          </h2>

          {list.isPending && <p style={{ color: THEME.muted }}>Cargando partidos...</p>}
          {list.isError && (
            <p style={{ color: "#f87171" }}>Error al cargar partidos: {list.error.message}</p>
          )}
          {list.isSuccess && <PartidosFinalizados partidos={finalizados} />}
        </Card>
      </div>
    </main>
  );
}
