// app/(private)/layout.tsx
"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import AuthGuard from "@/app/components/AuthGuard";
import Sidebar from "@/app/components/Sidebar";
import { Toaster } from "react-hot-toast";
import { ScoutProvider } from "@/context/ScoutContext";

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const Shell = (
    <div className="flex min-h-dvh overflow-x-hidden">
      <Toaster position="top-right" />

      {/* El Sidebar mantiene su fondo blanco, creando la separación */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <div className="flex min-h-dvh flex-1 min-w-0 flex-col">
        {/* Header de móvil con tema consistente */}
        <header className="sticky top-0 z-40 border-b lg:hidden" style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-3 p-3">
            <button
              aria-label="Abrir menú"
              className="rounded-lg p-2 transition-colors"
              style={{ color: 'var(--color-text)', backgroundColor: 'rgba(var(--color-accent-rgb), 0.1)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(var(--color-accent-rgb), 0.2)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(var(--color-accent-rgb), 0.1)')}
              onClick={() => setOpen(true)}
            >
              <Menu size={20} />
            </button>
            <span className="font-semibold" style={{ color: 'var(--color-text)' }}>SoftScout</span>
          </div>
        </header>

        {/* CAMBIO PRINCIPAL:
          Este <main> aplica el fondo del tema a TODA el área 
          de contenido. 
          Quitamos el padding (p-4) para que cada página lo maneje.
        */}
        <main className="flex-1 min-w-0 max-w-full overflow-y-auto" style={{ backgroundColor: 'var(--color-bg)' }}>
          {children}
        </main>
      </div>
    </div>
  );

  return (
    <AuthGuard>
      <ScoutProvider>{Shell}</ScoutProvider>
    </AuthGuard>
  );
}