// app/layout.tsx
import "./globals.css";
import { Proveedores } from "./proveedores";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";

export const metadata = {
  title: "SoftScout",
  description: "Sistema de gestión de scouts de béisbol",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Proveedores>
          <ThemeProvider>
            <AuthProvider>{children}</AuthProvider>
          </ThemeProvider>
        </Proveedores>
      </body>
    </html>
  );
}
