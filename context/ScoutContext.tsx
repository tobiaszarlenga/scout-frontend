"use client";
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { LanzamientoGuardado, PitcherEnPartido, ActivePitcher } from '@/types/scout';

export type PartidoScoutState = {
  lanzamientos: LanzamientoGuardado[];
  pitchersEnPartido: PitcherEnPartido[];
  // Contadores y estado de partido (opcional, se usan para persistir la UI)
  inning?: number;
  bolas?: number;
  strikes?: number;
  outs?: number;
  ladoInning?: 'abre' | 'cierra';
  activePitcher?: ActivePitcher;
  pitcherActivoLocalId?: string;
  pitcherActivoVisitanteId?: string;
};

type Store = Record<string, PartidoScoutState>; // key = partidoId

interface ScoutContextValue {
  getState: (partidoId: string) => PartidoScoutState | undefined;
  setStateForPartido: (partidoId: string, state: PartidoScoutState) => void;
  addLanzamiento: (partidoId: string, l: LanzamientoGuardado) => void;
  clearPartido: (partidoId: string) => void;
}

const ScoutContext = createContext<ScoutContextValue | null>(null);

const STORAGE_KEY = 'softscout_partidos_state';

// Cargar desde localStorage
const loadFromStorage = (): Store => {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (err) {
    console.error('Error loading scout state from localStorage:', err);
    return {};
  }
};

// Guardar en localStorage
const saveToStorage = (store: Store) => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Error saving scout state to localStorage:', err);
  }
};

export function ScoutProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store>(loadFromStorage);

  // Persistir cambios en localStorage
  useEffect(() => {
    saveToStorage(store);
  }, [store]);

  const value = useMemo<ScoutContextValue>(() => ({
    getState: (partidoId) => {
      const state = store[partidoId];
      console.log(`📊 ScoutContext.getState(${partidoId}):`, state);
      return state;
    },
    setStateForPartido: (partidoId, state) => {
      console.log(`💾 ScoutContext.setStateForPartido(${partidoId}):`, state);
      setStore((prev) => ({ ...prev, [partidoId]: state }));
    },
    addLanzamiento: (partidoId, l) => {
      console.log(`➕ ScoutContext.addLanzamiento(${partidoId}):`, l);
      setStore((prev) => {
        const current = prev[partidoId] ?? { lanzamientos: [], pitchersEnPartido: [] };
        const newState = {
          ...current,
          lanzamientos: [...current.lanzamientos, l],
        };
        console.log(`   Estado actualizado:`, newState);
        return {
          ...prev,
          [partidoId]: newState,
        };
      });
    },
    clearPartido: (partidoId) => {
      console.log(`🗑️ ScoutContext.clearPartido(${partidoId})`);
      setStore((prev) => {
        const copy = { ...prev };
        delete copy[partidoId];
        return copy;
      });
    },
  }), [store]);

  return (
    <ScoutContext.Provider value={value}>{children}</ScoutContext.Provider>
  );
}

export function useScout() {
  const ctx = useContext(ScoutContext);
  if (!ctx) throw new Error('useScout must be used within ScoutProvider');
  return ctx;
}
