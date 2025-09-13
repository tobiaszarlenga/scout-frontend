'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Calendar, Users, UserCircle, Target, BarChart3, FileText, Settings, X
} from "lucide-react";

const nav = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/partidos", label: "Partidos", icon: Calendar },
  { href: "/equipos", label: "Equipos", icon: Users },
  { href: "/pitchers", label: "Pitchers", icon: UserCircle },
  { href: "/bateadores", label: "Bateadores", icon: Target },
  { href: "/lanzamientos", label: "Lanzamientos", icon: BarChart3 },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/reportes", label: "Reportes", icon: FileText },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];

export default function Sidebar({
  open,
  onClose,
}: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  const content = (
    <aside className="flex h-full w-64 flex-col gap-2 bg-white p-4 shadow-sm">
      {/* Header + close (solo mobile) */}
      <div className="mb-2 flex items-center justify-between lg:hidden">
        <div className="font-semibold">SoftScout</div>
        <button
          aria-label="Cerrar menú"
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="space-y-1">
        {nav.map(({ href, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "block rounded-lg px-3 py-2 text-sm",
                active
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
              onClick={onClose}
            >
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto text-xs text-slate-400">SoftScout v1.0</div>
    </aside>
  );

  return (
    <>
      {/* Desktop: fijo */}
      <div className="hidden lg:block">{content}</div>

      {/* Mobile: off-canvas */}
      <div
        aria-hidden={!open}
        className={[
          "fixed inset-0 z-50 transform transition-transform lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Overlay clickeable */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
          role="button"
          aria-label="Cerrar overlay"
        />
        <div className="relative h-full w-72">{content}</div>
      </div>
    </>
  );
}