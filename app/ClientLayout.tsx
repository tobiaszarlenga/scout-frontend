// app/ClientLayout.tsx
"use client";
import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Link from 'next/link';
import { useAuth } from "@/contexts/AuthContext";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isLoading, user, logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar open={open} onClose={() => setOpen(false)} />

      {/* Contenido */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* HEADER UNIFICADO */}
        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between p-4 lg:p-8">
            <div className="flex items-center gap-3 lg:hidden">
              <button
                aria-label="Abrir menú"
                className="rounded-lg p-2 hover:bg-slate-100"
                onClick={() => setOpen(true)}
              >
                <Menu size={20} />
              </button>
              <span className="font-semibold">SoftScout</span>
            </div>

            <div className="flex-1 lg:hidden"></div>

            <div className="hidden lg:flex lg:flex-1">
              <h1 className="text-xl font-semibold">Panel Principal</h1>
            </div>

            <div className="flex items-center gap-4">
              {isLoading ? (
                <div className="h-8 w-24 animate-pulse rounded bg-gray-200"></div>
              ) : isAuthenticated ? (
                <>
                  <div className="text-sm">
                    Hola, <span className="font-semibold">{user?.name || user?.email}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="rounded bg-red-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500"
                  >
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}