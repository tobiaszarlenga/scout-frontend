// app/(private)/components/Sidebar.tsx

'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Calendar, Users, UserCircle, FileText, X,
  LogOut
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

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
  const { logout } = useAuth();

  const content = (
    // CAMBIO: Fondo azul oscuro. Quitamos sombra y cambiamos borde.
    <aside className="flex h-full w-64 flex-col bg-blue-800 p-4 border-r border-blue-600">
      
      {/* Header del sidebar: textos a blanco/azul claro */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          {/* CAMBIO: Texto a blanco */}
          <div className="text-xl font-bold text-white">SoftScout</div>
          {/* CAMBIO: Texto a azul claro */}
          <div className="text-sm text-blue-300">Scouting System</div>
        </div>
        <button
          aria-label="Cerrar menú"
          onClick={onClose}
          // CAMBIO: Color de icono y hover
          className="rounded-lg p-2 text-blue-400 hover:bg-blue-800 lg:hidden"
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
                // CAMBIO: Estilo ACTIVO para fondo oscuro
                active
                  ? "bg-blue-700 text-white font-medium" 
                // CAMBIO: Estilo INACTIVO para fondo oscuro
                  : "text-blue-200 hover:bg-blue-700 hover:text-white",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer del sidebar */}
      <div className="mt-auto">
        <button
          onClick={logout}
          // CAMBIO: Estilo "peligro" para fondo oscuro
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-400 transition hover:bg-red-900 hover:text-red-300"
        >
          <LogOut size={18} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
        {/* CAMBIO: Color de texto de versión */}
        <div className="mt-4 text-xs text-center text-blue-400">SoftScout v1.0</div>
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
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/40"
          role="button"
          aria-label="Cerrar overlay"
        />
        {/* CAMBIO: Aumentado de w-72 para que coincida con w-64 + padding */}
        <div className="relative h-full w-64">{content}</div>
      </div>
    </>
  );
}