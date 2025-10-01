// Configuración de usuarios para autenticación
// En producción, esto debería estar en una base de datos

export interface User {
  username: string;
  password: string;
  role: 'admin' | 'manager' | 'viewer';
  name: string;
  permissions: {
    canAdd: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canView: boolean;
    canExport: boolean;
    canImport: boolean;
  };
}

export const USERS: User[] = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin',
    name: 'Administrador',
    permissions: {
      canAdd: true,
      canEdit: true,
      canDelete: true,
      canView: true,
      canExport: true,
      canImport: true
    }
  },
  {
    username: 'manager',
    password: 'manager123',
    role: 'manager',
    name: 'Gerente',
    permissions: {
      canAdd: true,
      canEdit: true,
      canDelete: false, // Los gerentes no pueden eliminar
      canView: true,
      canExport: true,
      canImport: true
    }
  },
  {
    username: 'viewer',
    password: 'viewer123',
    role: 'viewer',
    name: 'Visualizador',
    permissions: {
      canAdd: false, // Solo puede ver
      canEdit: false,
      canDelete: false,
      canView: true,
      canExport: true,
      canImport: false
    }
  }
];

export function validateUser(username: string, password: string): User | null {
  const user = USERS.find(u => u.username === username && u.password === password);
  return user || null;
}

export function getUserByUsername(username: string): User | null {
  return USERS.find(u => u.username === username) || null;
}
