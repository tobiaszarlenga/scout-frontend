'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import Providers from './providers';           // 👈 NUEVO
import Sidebar from './components/Sidebar';     // 👈 usa tu ruta real
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <html lang="es">   
      <body className="bg-slate-50 text-slate-800">
        {/* 👇 Todo tu shell envuelto por Providers */}
        <Providers>
          <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar open={open} onClose={() => setOpen(false)} />

            {/* Contenido */}
            <div className="flex min-h-screen flex-1 flex-col">
              {/* Topbar (solo mobile) */}
              <header className="sticky top-0 z-40 border-b border-slate-200 bg-white lg:hidden">
                <div className="flex items-center gap-3 p-3">
                  <button
                    className="rounded-lg p-2 hover:bg-slate-100"
                    aria-label="Abrir menú"
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
        </Providers>
      </body>
    </html>
  );
}
