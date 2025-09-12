import "./globals.css";

import Sidebar from "./components/Sidebar";

export const metadata = {
  title: "SoftScout",
  description: "Sistema de scouting de sóftbol",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-slate-50 text-slate-800">
        <div className="grid grid-cols-[240px_1fr] min-h-dvh">
          <Sidebar />
          <main className="p-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
