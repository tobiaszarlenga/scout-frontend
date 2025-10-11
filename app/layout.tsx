"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import "./globals.css";

// === Providers ===
import { Proveedores } from "./proveedores"; // React Query wrapper
// Si tienen un provider de auth, descomenta e importalo:
// import { AuthProvider } from "./providers/auth";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const Shell = (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Contenido */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Topbar (mobile) */}
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

  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-800">
        {/* Si usan AuthProvider, envolver acá */}
        {/* <AuthProvider> */}
          <Proveedores>{Shell}</Proveedores>
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}
