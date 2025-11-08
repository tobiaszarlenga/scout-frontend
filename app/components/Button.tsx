"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const base = "inline-flex items-center justify-center font-medium rounded-md transition-shadow focus:outline-none";

  const sizes: Record<Size, string> = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-5 py-3 text-base",
  };

  const variants: Record<Variant, string> = {
    primary: "bg-accent text-white hover:bg-accent/90 shadow-md",
    secondary: "bg-card text-apptext border border-appborder hover:bg-appborder/5",
    ghost: "bg-transparent text-accent hover:underline",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const cls = [base, sizes[size], variants[variant], className].join(" ");

  return (
    <button className={cls} {...props}>
      {children}
    </button>
  );
}
