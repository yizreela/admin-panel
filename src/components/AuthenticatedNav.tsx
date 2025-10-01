'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermissions } from '../hooks/usePermissions';

interface TeamColors {
  [key: string]: {
    primary: string;
    secondary: string;
    hover: string;
    text: string;
  };
}

const teamColors: TeamColors = {
  'admin': {
    primary: 'bg-blue-600',
    secondary: 'bg-blue-50',
    hover: 'hover:bg-blue-700',
    text: 'text-blue-600'
  },
  'manager': {
    primary: 'bg-green-600',
    secondary: 'bg-green-50',
    hover: 'hover:bg-green-700',
    text: 'text-green-600'
  },
  'viewer': {
    primary: 'bg-purple-600',
    secondary: 'bg-purple-50',
    hover: 'hover:bg-purple-700',
    text: 'text-purple-600'
  },
  'default': {
    primary: 'bg-gray-600',
    secondary: 'bg-gray-50',
    hover: 'hover:bg-gray-700',
    text: 'text-gray-600'
  }
};

export default function AuthenticatedNav() {
  const pathname = usePathname();
  const { userInfo } = usePermissions();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // No mostrar si no está autenticado o no es cliente
  if (!isClient || !userInfo) {
    return null;
  }

  const currentTeam = userInfo.role || 'default';
  const colors = teamColors[currentTeam] || teamColors.default;

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/empleados', label: 'Empleados', icon: '👥' },
    { href: '/solicitudes', label: 'Solicitudes', icon: '📋' }
  ];

  return (
    <nav className={`${colors.primary} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="text-2xl">🏢</span>
              <span className="text-white font-bold text-lg">
                Admin Panel
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                    ${isActive 
                      ? `${colors.secondary} ${colors.text} font-semibold` 
                      : `text-white hover:bg-white hover:bg-opacity-20`
                    }
                  `}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="text-white text-sm">
              <span className="font-medium">{userInfo.name}</span>
              <span className="text-white text-opacity-75 ml-2">
                ({userInfo.role})
              </span>
            </div>
            <Link
              href="/login"
              className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-800 px-3 py-1 rounded-lg transition-all duration-200 text-sm font-medium border border-white border-opacity-30"
            >
              Cerrar Sesión
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
