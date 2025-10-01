'use client';

import { useRouter } from 'next/navigation';
import UserInfo from './UserInfo';

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Eliminar cookies de autenticación
    document.cookie = 'admin-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user-data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    // Redirigir al login
    router.push('/login');
  };

  return (
    <div className="flex items-center gap-3">
      <UserInfo />
      <button
        onClick={handleLogout}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
        Cerrar Sesión
      </button>
    </div>
  );
}
