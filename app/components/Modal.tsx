// scout-frontend/app/components/Modal/index.tsx

"use client";

import { useEffect } from "react";
// 1. Importamos la magia de "createPortal" desde react-dom
import { createPortal } from "react-dom";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  // Todo este código de useEffect se queda exactamente igual
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  // 2. Usamos el portal para "teletransportar" el JSX del modal
  //    directamente al <body> del documento.
  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-label="Cerrar"
        role="button"
      />
      {/* Caja */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
      >
        {title && <h3 className="mb-3 text-lg font-semibold">{title}</h3>}
        {children}
      </div>
    </div>,
    document.body
  );
}