'use client';

import { useState, useEffect } from 'react';

interface UserData {
  username: string;
  role: string;
  name: string;
}

export default function UserInfo() {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    // Obtener datos del usuario desde la cookie
    const cookies = document.cookie.split(';');
    const userDataCookie = cookies.find(cookie => cookie.trim().startsWith('user-data='));
    
    if (userDataCookie) {
      try {
        const userDataString = userDataCookie.split('=')[1];
        const userData = JSON.parse(decodeURIComponent(userDataString));
        setUserData(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  if (!userData) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return '👑';
      case 'user': return '👤';
      default: return '👤';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-red-600 bg-red-50 border-red-200';
      case 'user': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="text-lg">{getRoleIcon(userData.role)}</span>
        <div className="text-sm">
          <div className="font-medium text-gray-900">{userData.name}</div>
          <div className={`text-xs px-2 py-1 rounded-full border ${getRoleColor(userData.role)}`}>
            {userData.role === 'admin' ? 'Administrador' : 'Usuario'}
          </div>
        </div>
      </div>
    </div>
  );
}
