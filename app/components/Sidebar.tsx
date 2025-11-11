"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Users,
  UserCircle,
  FileText,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "./ThemeToggle";

const nav = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/partidos", label: "Partidos", icon: Calendar },
  { href: "/equipos", label: "Equipos", icon: Users },
  { href: "/pitchers", label: "Pitchers", icon: UserCircle },
  { href: "/reportes", label: "Reportes", icon: FileText },
];

// 🎨 Paleta SoftScout (referencias a variables globales)
const COLORS = {
  bgFrom: "var(--color-sidebar)",
  bgTo: "var(--color-sidebar)",
  card: "var(--color-card)",
  text: "var(--color-text)",
  accent: "var(--color-accent)",
  edit: "#3B82F6",
};

export default function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const content = (
    // ⬇️ altura completa de la ventana para evitar "cortes" al fondo
    <aside
      className="flex h-screen w-64 flex-col border-r p-4"
      style={{
        background: `linear-gradient(180deg, ${COLORS.bgFrom}, ${COLORS.bgTo})`,
        borderColor: "var(--color-card)",
      }}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="text-xl font-bold" style={{ color: COLORS.text }}>
            SoftScout
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            aria-label="Cerrar menú"
            onClick={onClose}
            className="rounded-lg p-2 text-[rgba(var(--color-text-rgb),0.6)] hover:bg-[var(--color-card)] lg:hidden"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* NAV LINKS — Este contenedor sí tiene scroll si hace falta */}
      <nav className="space-y-1 flex-1 overflow-y-auto">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 hover:bg-[var(--color-card)]",
                active ? "font-semibold" : "",
              ].join(" ")}
                style={{
                backgroundColor: active ? "rgba(34,49,63,0.65)" : "transparent",
                color: COLORS.text,
              }}
              aria-current={active ? "page" : undefined}
              onClick={onClose}
            >
              {/* barrita curva animada: blanco en hover, naranja activo */}
              <span
                className={[
                  "pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1.5 rounded-r-full transition-all duration-300",
                  active ? "opacity-100" : "opacity-0",
                ].join(" ")}
                style={{ backgroundColor: COLORS.accent }}
              />
              {!active && (
                <span
                  className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-0 w-1.5 rounded-r-full opacity-0 transition-all duration-300 group-hover:h-8 group-hover:opacity-100"
                  style={{ backgroundColor: "#FFFFFF" }}
                />
              )}

              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* FOOTER — siempre visible (fuera del área con scroll) */}
      <footer className="pt-4 border-t border-[#2c3d4a]">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-900 hover:text-red-300"
        >
          <LogOut size={18} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </footer>
    </aside>
  );

  return (
    <>
      {/* Desktop: sidebar fijo + spacer para no superponer el contenido */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-30">{content}</div>
      <div className="hidden lg:block w-64 shrink-0" aria-hidden />

      {/* Mobile: off-canvas */}
      <div
        aria-hidden={!open}
        className={[
          "fixed inset-0 z-50 transform transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
          role="button"
          aria-label="Cerrar overlay"
        />
        <div className="relative h-full w-64">{content}</div>
      </div>
    </>
  );
}
