# 🔐 Sistema de Permisos - Admin Panel

## **Usuarios y Permisos**

### **👑 Administrador (admin/admin123)**
- ✅ **Agregar empleados**: Sí
- ✅ **Editar empleados**: Sí  
- ✅ **Eliminar empleados**: Sí
- ✅ **Ver empleados**: Sí
- ✅ **Exportar CSV**: Sí
- ✅ **Importar CSV**: Sí

### **👤 Gerente (manager/manager123)**
- ✅ **Agregar empleados**: Sí
- ✅ **Editar empleados**: Sí
- ❌ **Eliminar empleados**: No (sin permisos)
- ✅ **Ver empleados**: Sí
- ✅ **Exportar CSV**: Sí
- ✅ **Importar CSV**: Sí

### **👁️ Visualizador (viewer/viewer123)**
- ❌ **Agregar empleados**: No (solo lectura)
- ❌ **Editar empleados**: No (solo lectura)
- ❌ **Eliminar empleados**: No (solo lectura)
- ✅ **Ver empleados**: Sí
- ✅ **Exportar CSV**: Sí
- ❌ **Importar CSV**: No (sin permisos)

## **🎯 Comportamiento por Usuario**

### **Administrador**
- **Acceso completo** a todas las funcionalidades
- Puede **agregar, editar, eliminar** empleados
- Puede **importar y exportar** datos
- Ve todos los botones **habilitados**

### **Gerente**
- Puede **agregar y editar** empleados
- **NO puede eliminar** empleados (botón deshabilitado)
- Puede **importar y exportar** datos
- Ve botón de eliminar **deshabilitado** con mensaje "Sin permisos"

### **Visualizador**
- **Solo puede ver** los datos
- **NO puede agregar, editar o eliminar** empleados
- Puede **exportar** datos
- **NO puede importar** datos
- Ve botones de acción **deshabilitados** con mensaje "Sin permisos"

## **🔧 Cómo Modificar Permisos**

### **1. Editar Usuario Existente**
```typescript
// En src/lib/auth-config.ts
{
  username: 'manager',
  password: 'manager123',
  role: 'manager',
  name: 'Gerente',
  permissions: {
    canAdd: true,        // Cambiar a false para quitar permiso
    canEdit: true,       // Cambiar a false para quitar permiso
    canDelete: false,    // Cambiar a true para dar permiso
    canView: true,
    canExport: true,
    canImport: true
  }
}
```

### **2. Agregar Nuevo Usuario**
```typescript
// En src/lib/auth-config.ts
{
  username: 'nuevo_usuario',
  password: 'nueva_password',
  role: 'custom',
  name: 'Nuevo Usuario',
  permissions: {
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canView: true,
    canExport: true,
    canImport: false
  }
}
```

### **3. Crear Nuevo Rol**
```typescript
// En src/hooks/usePermissions.ts
const rolePermissions: Record<string, UserPermissions> = {
  admin: { /* permisos admin */ },
  manager: { /* permisos manager */ },
  viewer: { /* permisos viewer */ },
  // Agregar nuevo rol
  supervisor: {
    canAdd: true,
    canEdit: true,
    canDelete: false,
    canView: true,
    canExport: true,
    canImport: true
  }
};
```

## **🎨 Indicadores Visuales**

### **Botones Habilitados**
- **Color normal** (azul, verde, rojo, etc.)
- **Hover effects** activos
- **Funcionalidad completa**

### **Botones Deshabilitados**
- **Color gris** con opacidad reducida
- **Sin hover effects**
- **Tooltip** "Sin permisos"
- **No funcional**

## **🔒 Seguridad**

- **Permisos del lado del cliente**: Para UX
- **Validación del servidor**: Necesaria para seguridad real
- **Cookies seguras**: Datos del usuario encriptados
- **Middleware**: Protección de rutas

## **📝 Notas Importantes**

1. **Los permisos se aplican inmediatamente** al cambiar de usuario
2. **No se requiere reiniciar** el servidor para cambios
3. **Los datos se mantienen** independientemente del usuario
4. **La autenticación es persistente** hasta cerrar sesión
5. **Cada usuario ve solo** las funcionalidades permitidas

## **🚀 Próximos Pasos**

- [ ] Implementar validación del servidor
- [ ] Agregar logs de auditoría
- [ ] Crear roles dinámicos
- [ ] Integrar con base de datos
- [ ] Añadir permisos granulares por módulo
