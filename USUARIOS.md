# Gestión de Usuarios 🔐

## Ubicación de las Credenciales

Las credenciales de usuario se encuentran en el archivo:
```
src/lib/auth-config.ts
```

## Usuarios Disponibles

### 👑 Administrador
- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: `admin`
- **Nombre**: Administrador

### 👤 Gerente
- **Usuario**: `manager`
- **Contraseña**: `manager123`
- **Rol**: `user`
- **Nombre**: Gerente

### 👁️ Visualizador
- **Usuario**: `viewer`
- **Contraseña**: `viewer123`
- **Rol**: `user`
- **Nombre**: Visualizador

## Cómo Agregar un Nuevo Usuario

1. **Abre el archivo** `src/lib/auth-config.ts`
2. **Agrega un nuevo objeto** al array `USERS`:

```typescript
{
  username: 'nuevo_usuario',
  password: 'nueva_contraseña',
  role: 'user', // o 'admin'
  name: 'Nombre del Usuario'
}
```

### Ejemplo:
```typescript
export const USERS: User[] = [
  // ... usuarios existentes ...
  {
    username: 'supervisor',
    password: 'supervisor123',
    role: 'user',
    name: 'Supervisor'
  }
];
```

## Cómo Cambiar una Contraseña

1. **Abre el archivo** `src/lib/auth-config.ts`
2. **Encuentra el usuario** que quieres modificar
3. **Cambia el valor** de la propiedad `password`

### Ejemplo:
```typescript
{
  username: 'admin',
  password: 'nueva_contraseña_segura', // ← Cambiar aquí
  role: 'admin',
  name: 'Administrador'
}
```

## Cómo Cambiar el Nombre de Usuario

1. **Abre el archivo** `src/lib/auth-config.ts`
2. **Cambia el valor** de la propiedad `username`

### Ejemplo:
```typescript
{
  username: 'nuevo_nombre_usuario', // ← Cambiar aquí
  password: 'admin123',
  role: 'admin',
  name: 'Administrador'
}
```

## Roles Disponibles

- **`admin`**: Administrador (acceso completo)
- **`user`**: Usuario regular (acceso limitado)

## Seguridad

⚠️ **Importante**: Este sistema es para desarrollo/testing. En producción deberías:

1. **Usar una base de datos** para almacenar usuarios
2. **Encriptar contraseñas** con hash (bcrypt, etc.)
3. **Implementar autenticación JWT** o similar
4. **Usar variables de entorno** para credenciales sensibles

## Reiniciar el Servidor

Después de hacer cambios en `auth-config.ts`, reinicia el servidor:

```bash
# Detener el servidor (Ctrl+C)
# Luego ejecutar:
npm run dev
```

## Variables de Entorno (Opcional)

También puedes usar variables de entorno en `.env.local`:

```bash
# Para un usuario principal
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD=admin123
```

Estas variables se usan como fallback si no se encuentra el usuario en `auth-config.ts`.
