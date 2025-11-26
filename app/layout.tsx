// app/layout.tsx
import "./globals.css";
import { Proveedores } from "./proveedores";
import { AuthProvider } from "../context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import Script from 'next/script';

export const metadata = {
  title: "SoftScout",
  description: "Sistema de gestión de scouts de softbol",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Use Next <Script> with beforeInteractive so theme is applied before hydration */}
        <Script id="set-theme" strategy="beforeInteractive">
          {`try{const t=localStorage.getItem('softscout:theme');if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.setAttribute('data-theme','dark')}catch(e){}`}
        </Script>
      </head>
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
