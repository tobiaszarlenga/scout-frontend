// app/components/ConfirmDialog.tsx
"use client";

import Modal from "./Modal";
import Button from "./Button";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const getVariantColor = () => {
    switch (variant) {
      case "danger":
        return "#ef4444"; // red-500
      case "warning":
        return "var(--color-accent)"; // orange
      case "info":
        return "#3b82f6"; // blue-500
      default:
        return "var(--color-accent)";
    }
  };

  return (
    <Modal open={open} onClose={onCancel} title={title}>
      <div className="px-6 py-4">
        <p className="text-base" style={{ color: "var(--color-text)" }}>
          {message}
        </p>
      </div>

      <div className="flex justify-end gap-3 border-t px-6 py-4" style={{ borderColor: "var(--color-border)" }}>
        <Button
          variant="secondary"
          onClick={onCancel}
        >
          {cancelLabel}
        </Button>
        <Button
          onClick={onConfirm}
          style={{ backgroundColor: getVariantColor() }}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
