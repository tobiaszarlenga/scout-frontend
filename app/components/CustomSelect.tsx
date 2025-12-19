'use client';

import { useState, useRef, useEffect } from 'react';

interface Option {
  id: number | string;
  nombre: string;
}

interface CustomSelectProps {
  value: number | string | '';
  onChange: (value: number | string) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  error?: string;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Seleccione una opción',
  disabled = false,
  isLoading = false,
  error,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLButtonElement>(null);

  // Obtener el label de la opción seleccionada (comparación flexible para string/number)
  const selectedLabel = options.find(opt => opt.id == value)?.nombre || placeholder;

  // Detectar si debe abrir hacia arriba o hacia abajo
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 300; // maxHeight del dropdown
      
      // Si no hay suficiente espacio abajo pero sí arriba, abrir hacia arriba
      if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  }, [isOpen]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const handleSelect = (optionId: number | string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={inputRef}
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled || isLoading}
        className="w-full appearance-none rounded-lg px-4 py-3 pr-10 font-medium shadow-sm transition-all duration-200 cursor-pointer text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[var(--color-bg)]"
        style={{
          backgroundColor: 'var(--color-card)',
          color: value ? 'var(--color-text)' : 'var(--color-muted)',
          border: '1px solid var(--color-border)',
        }}
      >
        {isLoading ? 'Cargando equipos...' : selectedLabel}
      </button>

      {/* Dropdown icon */}
      <svg
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none transition-transform duration-200 ${
          isOpen ? 'rotate-180' : ''
        }`}
        style={{ color: 'var(--color-text)' }}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
      </svg>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={`absolute z-50 w-full rounded-lg shadow-lg border border-solid animate-in fade-in duration-200 ${
            openUpward ? 'bottom-full mb-2 slide-in-from-bottom-2' : 'mt-2 slide-in-from-top-2'
          }`}
          style={{
            backgroundColor: 'var(--color-card)',
            borderColor: 'var(--color-border)',
            maxHeight: '300px',
            overflowY: 'auto',
          }}
        >
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm" style={{ color: 'var(--color-muted)' }}>
              No hay opciones disponibles
            </div>
          ) : (
            options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option.id)}
                className="w-full px-4 py-3 text-left text-sm font-medium transition-colors duration-150 hover:bg-opacity-80"
                style={{
                  backgroundColor:
                    value == option.id ? 'var(--color-accent)' : 'transparent',
                  color:
                    value == option.id ? 'white' : 'var(--color-text)',
                }}
                onMouseEnter={(el) => {
                  if (value != option.id) {
                    el.currentTarget.style.backgroundColor = 'rgba(207, 83, 0, 0.15)';
                  }
                }}
                onMouseLeave={(el) => {
                  if (value != option.id) {
                    el.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                {option.nombre}
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
