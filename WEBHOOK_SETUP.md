# 🔔 Configuración de Webhooks para Google Sheets

## 📋 Resumen
Este sistema permite recibir notificaciones en tiempo real cuando se modifica el Google Sheet, eliminando la necesidad de polling constante.

## 🛠️ Configuración Paso a Paso

### 1. Configurar Variables de Entorno en Vercel

Agrega estas variables en tu proyecto de Vercel:

```bash
WEBHOOK_SECRET_TOKEN=tu-token-secreto-muy-seguro-aqui
```

### 2. Configurar Google Apps Script

1. **Ve a tu Google Sheet**
2. **Extensions > Apps Script**
3. **Reemplaza el código existente** con el contenido de `google-apps-script.js`
4. **Actualiza la configuración** en el script:

```javascript
const CONFIG = {
  // Cambia por tu URL de Vercel
  WEBHOOK_URL: 'https://tu-app.vercel.app/api/webhook/sheet-updated',
  
  // Debe coincidir con WEBHOOK_SECRET_TOKEN en Vercel
  SECRET_TOKEN: 'tu-token-secreto-muy-seguro-aqui',
  
  // Opcional: ID específico del sheet
  SHEET_ID: '1MRLfAfP8t1SjL0W4kWbetrk1aCB06j2Cd6EuvxMOjhE'
};
```

### 3. Configurar Triggers Automáticos

En Google Apps Script:

1. **Ejecuta la función `setupTriggers()`** una vez
2. **Autoriza los permisos** cuando se soliciten
3. **Verifica que los triggers estén activos** en el menú "Triggers"

### 4. Probar la Configuración

1. **Ejecuta `testWebhook()`** en Google Apps Script
2. **Verifica en los logs** de Vercel que llegue el webhook
3. **Edita el Google Sheet** y verifica que se actualice la app

## 🔧 Funcionamiento

### Flujo de Datos:
1. **Usuario edita Google Sheet**
2. **Google Apps Script detecta el cambio**
3. **Envía webhook a tu app Vercel**
4. **App procesa el webhook**
5. **Broadcast a todas las conexiones activas**
6. **UI se actualiza automáticamente**

### Tipos de Eventos:
- `edit`: Celda modificada
- `insert`: Fila insertada
- `delete`: Fila eliminada

## 🚀 Beneficios vs Polling

| Aspecto | Polling | Webhooks |
|---------|--------|----------|
| **Eficiencia** | ❌ Verifica cada 30s | ✅ Solo cuando hay cambios |
| **Latencia** | ❌ Hasta 30s de retraso | ✅ Inmediato |
| **Recursos** | ❌ Alto uso de CPU/red | ✅ Mínimo uso |
| **Escalabilidad** | ❌ No escala bien | ✅ Escala perfectamente |

## 🔍 Debugging

### Verificar Webhooks:
```bash
# Verificar endpoint
curl https://tu-app.vercel.app/api/webhook/sheet-updated

# Probar webhook manualmente
curl -X POST https://tu-app.vercel.app/api/webhook/sheet-updated \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer tu-token-secreto" \
  -d '{"sheetId":"test","range":"A1","eventType":"edit","timestamp":"2024-01-01T00:00:00Z"}'
```

### Logs de Vercel:
- Ve a **Functions > Logs** en Vercel
- Busca mensajes con `🔔 Webhook recibido`
- Verifica que no haya errores de autenticación

## 🛡️ Seguridad

- **Token secreto**: Usa un token fuerte y único
- **HTTPS**: Solo funciona con HTTPS (Vercel lo proporciona)
- **Validación**: El endpoint valida el token antes de procesar

## 📱 Indicadores Visuales

La app muestra:
- 🟢 **Verde pulsante**: Conectado en tiempo real
- 🔴 **Rojo**: Desconectado
- **Timestamp**: Última actualización recibida

## 🆘 Solución de Problemas

### Webhook no llega:
1. Verifica que `WEBHOOK_SECRET_TOKEN` esté configurado
2. Confirma que la URL sea correcta
3. Revisa los logs de Google Apps Script

### App no se actualiza:
1. Verifica la conexión SSE en DevTools
2. Revisa los logs de Vercel
3. Confirma que el broadcast funcione

### Triggers no funcionan:
1. Re-ejecuta `setupTriggers()`
2. Verifica permisos de Google Apps Script
3. Confirma que el sheet esté compartido correctamente
