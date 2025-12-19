// context/PitchersContext.tsx
'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePitchers } from '../hooks/usePitchers';

// 1. Definimos la "forma" de los datos
type PitchersContextType = ReturnType<typeof usePitchers>;

// 2. Creamos el contexto
export const PitchersContext = createContext<PitchersContextType | undefined>(undefined);

// 3. Creamos un hook personalizado para consumir el contexto
export const usePitchersContext = () => {
  const context = useContext(PitchersContext);
  if (!context) {
    throw new Error('usePitchersContext debe ser usado dentro de un PitchersProvider');
  }
  return context;
};

// 4. Creamos y EXPORTAMOS el componente "Proveedor"
interface Props {
  children: ReactNode;
}

export const PitchersProvider = ({ children }: Props) => { // <-- ASEGÚRATE DE QUE ESTA LÍNEA TENGA "EXPORT"
  const pitcherData = usePitchers();

  return (
    <PitchersContext.Provider value={pitcherData}>
      {children}
    </PitchersContext.Provider>
  );
};