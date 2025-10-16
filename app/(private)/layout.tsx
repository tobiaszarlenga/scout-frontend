// app/(private)/layout.tsx
"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import AuthGuard from "@/app/components/AuthGuard"; // El guardián protege este layout
import Sidebar from "@/app/components/Sidebar"; // Ajusta la ruta si es necesario

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  // Este es el Shell que antes estaba en el layout principal
  const Shell = (
    <div className="flex min-h-screen">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white lg:hidden">
          <div className="flex items-center gap-3 p-3">
            <button
              aria-label="Abrir menú"
              className="rounded-lg p-2 hover:bg-slate-100"
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold">SoftScout</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );

  return <AuthGuard>{Shell}</AuthGuard>;
}