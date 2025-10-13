// app/components/Header.tsx
"use client";

import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import UserInfo from './UserInfo';       // El componente que creamos antes
import LogoutButton from './LogoutButton'; // El componente que creamos antes

export default function Header() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <header className="bg-white shadow-md p-4">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-blue-600">
          SoftScout
        </Link>
        
        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
          ) : isAuthenticated ? (
            <>
              <UserInfo />
              <LogoutButton />
            </>
          ) : (
            <Link 
              href="/login" 
              className="rounded-md bg-green-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
            >
              Iniciar Sesión
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}