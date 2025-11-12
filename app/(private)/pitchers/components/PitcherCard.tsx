// app/(private)/pitchers/components/PitcherCard.tsx
"use client";

import Image from "next/image";
import { User, Edit, Trash2 } from "lucide-react";
// 1. Asegúrate de importar tu tipo 'Pitcher' real
// import { Pitcher } from '@/types/pitcher'; 

// (Temporal, si no tienes el tipo)
type Pitcher = {
  id: string;
  nombre: string;
  numero: number;
  equipo: string;
  avatarUrl?: string | null;
};

interface PitcherCardProps {
  pitcher: Pitcher;
  onEdit: (pitcher: Pitcher) => void;
  onDelete: (pitcher: Pitcher) => void;
}

export default function PitcherCard({
  pitcher,
  onEdit,
  onDelete,
}: PitcherCardProps) {
  return (
    <div className="group relative transform-gpu rounded-xl bg-white p-6 text-center shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl">
      {/* Botones de Editar/Eliminar (Aparecen al hacer hover) */}
      <div className="absolute top-3 right-3 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={() => onEdit(pitcher)}
          className="rounded-full bg-blue-100 p-2 text-blue-600 hover:bg-blue-200"
          aria-label="Editar"
        >
          <Edit size={16} />
        </button>
        <button
          onClick={() => onDelete(pitcher)}
          className="rounded-full bg-red-100 p-2 text-red-600 hover:bg-red-200"
          aria-label="Eliminar"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Avatar */}
      <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-slate-400">
        {pitcher.avatarUrl ? (
          <Image
            src={pitcher.avatarUrl}
            alt={pitcher.nombre}
            width={80}
            height={80}
            className="h-20 w-20 rounded-full object-cover"
          />
        ) : (
          <User size={40} />
        )}
      </div>

      {/* Info */}
      <h3 className="text-lg font-semibold capitalize text-slate-800">
        {pitcher.nombre.toLowerCase()}
      </h3>
      <p className="text-sm capitalize text-slate-500">{pitcher.equipo}</p>
      <p className="mt-2 text-xs font-medium text-slate-400">#{pitcher.numero}</p>
    </div>
  );
}