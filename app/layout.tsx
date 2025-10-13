// app/layout.tsx
import "./globals.css";
import { Proveedores } from "./proveedores";
import { AuthProvider } from "@/contexts/AuthContext";
import ClientLayout from "./ClientLayout"; // 👈 Importamos el nuevo componente

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-800">
        <AuthProvider>
          <Proveedores>
            <ClientLayout>{children}</ClientLayout>
          </Proveedores>
        </AuthProvider>
      </body>
    </html>
  );
}