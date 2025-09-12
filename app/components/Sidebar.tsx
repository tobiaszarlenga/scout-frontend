'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home, Calendar, Users, UserCircle, Target, BarChart3, FileText, Settings
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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="bg-white border-r border-slate-200 p-4 w-60 min-h-dvh sticky top-0">
      <div className="mb-6">
        <div className="text-xl font-bold">SoftScout</div>
        <div className="text-sm text-slate-500">Scouting System</div>
      </div>

      <nav className="space-y-1">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2 transition",
                active
                  ? "bg-slate-100 text-slate-900 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 text-xs text-slate-400">SoftScout v1.0</div>
    </aside>
  );
}
