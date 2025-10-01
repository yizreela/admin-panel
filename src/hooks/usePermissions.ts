'use client';

import { useState, useEffect } from 'react';

interface UserPermissions {
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canView: boolean;
  canExport: boolean;
  canImport: boolean;
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<UserPermissions>({
    canAdd: false,
    canEdit: false,
    canDelete: false,
    canView: true,
    canExport: false,
    canImport: false
  });

  const [userInfo, setUserInfo] = useState<{
    username: string;
    role: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    // Obtener datos del usuario desde la cookie
    const cookies = document.cookie.split(';');
    const userDataCookie = cookies.find(cookie => cookie.trim().startsWith('user-data='));
    
    if (userDataCookie) {
      try {
        const userDataString = userDataCookie.split('=')[1];
        const userData = JSON.parse(decodeURIComponent(userDataString));
        setUserInfo(userData);
        
        // Mapear permisos basados en el rol
        const rolePermissions: Record<string, UserPermissions> = {
          admin: {
            canAdd: true,
            canEdit: true,
            canDelete: true,
            canView: true,
            canExport: true,
            canImport: true
          },
          manager: {
            canAdd: true,
            canEdit: true,
            canDelete: false,
            canView: true,
            canExport: true,
            canImport: true
          },
          viewer: {
            canAdd: false,
            canEdit: false,
            canDelete: false,
            canView: true,
            canExport: true,
            canImport: false
          }
        };
        
        setPermissions(rolePermissions[userData.role] || rolePermissions.viewer);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  return { permissions, userInfo };
}
