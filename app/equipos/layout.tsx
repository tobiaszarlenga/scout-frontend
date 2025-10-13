// app/equipos/layout.tsx
import ProtectedRoute from '../components/ProtectedRoute';
import Protector from '../components/ProtectedRoute'; // Importamos nuestro protector

export default function EquiposLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}