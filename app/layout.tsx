// app/layout.tsx
"use client";
// ¡Quitamos casi todo de aquí!

import "./globals.css";
import { Proveedores } from "./proveedores";
import { AuthProvider } from "../context/AuthContext";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-800">
        <Proveedores>
        
          <AuthProvider>
            {children}
          </AuthProvider>
        </Proveedores>
      </body>
    </html>
  );
}