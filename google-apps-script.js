/**
 * Google Apps Script para enviar webhooks cuando se modifica el Google Sheet
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Ve a tu Google Sheet
 * 2. Extensions > Apps Script
 * 3. Pega este código
 * 4. Configura las variables de entorno
 * 5. Guarda y autoriza el script
 * 6. Configura el trigger automático
 */

// CONFIGURACIÓN - Cambia estos valores
const CONFIG = {
  // URL de tu webhook (reemplaza con tu dominio de Vercel)
  WEBHOOK_URL: 'https://tu-app.vercel.app/api/webhook/sheet-updated',
  
  // Token secreto para autenticación (debe coincidir con WEBHOOK_SECRET_TOKEN en Vercel)
  SECRET_TOKEN: 'tu-token-secreto-aqui',
  
  // ID de tu Google Sheet (opcional, se detecta automáticamente)
  SHEET_ID: '1MRLfAfP8t1SjL0W4kWbetrk1aCB06j2Cd6EuvxMOjhE'
};

/**
 * Función que se ejecuta cuando se edita el sheet
 */
function onEdit(e) {
  try {
    console.log('📝 Sheet editado:', e.range.getA1Notation());
    
    sendWebhook({
      sheetId: e.source.getId(),
      range: e.range.getA1Notation(),
      eventType: 'edit',
      timestamp: new Date().toISOString(),
      userId: e.user.getEmail()
    });
    
  } catch (error) {
    console.error('❌ Error en onEdit:', error);
  }
}

/**
 * Función que se ejecuta cuando se inserta una fila
 */
function onInsert(e) {
  try {
    console.log('➕ Fila insertada:', e.range.getA1Notation());
    
    sendWebhook({
      sheetId: e.source.getId(),
      range: e.range.getA1Notation(),
      eventType: 'insert',
      timestamp: new Date().toISOString(),
      userId: e.user.getEmail()
    });
    
  } catch (error) {
    console.error('❌ Error en onInsert:', error);
  }
}

/**
 * Función que se ejecuta cuando se elimina una fila
 */
function onDelete(e) {
  try {
    console.log('🗑️ Fila eliminada:', e.range.getA1Notation());
    
    sendWebhook({
      sheetId: e.source.getId(),
      range: e.range.getA1Notation(),
      eventType: 'delete',
      timestamp: new Date().toISOString(),
      userId: e.user.getEmail()
    });
    
  } catch (error) {
    console.error('❌ Error en onDelete:', error);
  }
}

/**
 * Envía el webhook a tu aplicación
 */
function sendWebhook(payload) {
  try {
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${CONFIG.SECRET_TOKEN}`
      },
      payload: JSON.stringify(payload)
    };
    
    const response = UrlFetchApp.fetch(CONFIG.WEBHOOK_URL, options);
    
    if (response.getResponseCode() === 200) {
      console.log('✅ Webhook enviado exitosamente');
    } else {
      console.error('❌ Error enviando webhook:', response.getContentText());
    }
    
  } catch (error) {
    console.error('❌ Error en sendWebhook:', error);
  }
}

/**
 * Función de prueba para verificar la configuración
 */
function testWebhook() {
  console.log('🧪 Probando webhook...');
  
  sendWebhook({
    sheetId: CONFIG.SHEET_ID || SpreadsheetApp.getActiveSpreadsheet().getId(),
    range: 'A1:Z100',
    eventType: 'edit',
    timestamp: new Date().toISOString(),
    userId: 'test@example.com'
  });
  
  console.log('✅ Test completado');
}

/**
 * Configurar triggers automáticos
 */
function setupTriggers() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet();
  
  // Eliminar triggers existentes
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction().includes('onEdit') || 
        trigger.getHandlerFunction().includes('onInsert') ||
        trigger.getHandlerFunction().includes('onDelete')) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Crear nuevos triggers
  ScriptApp.newTrigger('onEdit')
    .for(sheet)
    .onEdit()
    .create();
    
  ScriptApp.newTrigger('onInsert')
    .for(sheet)
    .onChange()
    .create();
    
  ScriptApp.newTrigger('onDelete')
    .for(sheet)
    .onChange()
    .create();
    
  console.log('✅ Triggers configurados correctamente');
}
