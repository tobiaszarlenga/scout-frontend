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
  size = 'md',
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
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
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-label="Cerrar"
        role="button"
      />
      {/* Caja: usar variables de tema (bg-card, border-appborder, text-apptext) */}
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full rounded-2xl border p-6 shadow-xl ${
          size === 'sm'
            ? 'max-w-md'
            : size === 'md'
            ? 'max-w-2xl'
            : size === 'lg'
            ? 'max-w-4xl'
            : 'max-w-6xl'
        }`}
        // Modal panel should use the card color so it appears as a distinct
        // white/light panel over the app background. Keep text and border
        // using theme tokens for legibility.
        style={{ backgroundColor: 'var(--color-card)', color: 'var(--color-text)', borderColor: 'var(--color-border)' }}
      >
        {title && <h3 className="mb-4 text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>}
        <div className="mb-4">{children}</div>
        {footer && (
          <div className="mt-4 border-t border-appborder pt-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}