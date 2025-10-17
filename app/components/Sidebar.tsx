// app/(private)/components/Sidebar.tsx

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Calendar, Users, UserCircle, FileText, X,
  LogOut // 1. Importamos el ícono de LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext"; // y el hook de autenticación

const nav = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/partidos", label: "Partidos", icon: Calendar },
  { href: "/equipos", label: "Equipos", icon: Users },
  { href: "/pitchers", label: "Pitchers", icon: UserCircle },
  { href: "/reportes", label: "Reportes", icon: FileText },
];

export default function Sidebar({
  open,
  onClose,
}: { open?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const { logout } = useAuth(); // 2. Obtenemos la función de logout desde el hook

  const content = (
    // Envolvemos todo en un flex-col para poder usar mt-auto
    <aside className="flex h-full w-64 flex-col bg-white p-4 shadow-sm border-r border-slate-200">
      {/* Header del sidebar: siempre visible; el botón X solo en mobile */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-xl font-bold">SoftScout</div>
          <div className="text-sm text-slate-500">Scouting System</div>
        </div>
        <button
          aria-label="Cerrar menú"
          onClick={onClose}
          className="rounded-lg p-2 hover:bg-slate-100 lg:hidden"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = href === "/"
            ? pathname === "/"
            : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition",
                active
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
              onClick={onClose} // en mobile cierra el menú al navegar
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Contenedor del footer que se empuja hacia abajo */}
      <div className="mt-auto">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-200 hover:text-red"
        >
          <LogOut size={18} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
        <div className="mt-4 text-xs text-center text-slate-400">SoftScout v1.0</div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop: fijo y sticky */}
      <div className="hidden lg:block sticky top-0 min-h-dvh">{content}</div>

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