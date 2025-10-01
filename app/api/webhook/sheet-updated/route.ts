import { NextRequest, NextResponse } from 'next/server';
import { broadcastToConnections } from '../events/route';

interface WebhookPayload {
  sheetId: string;
  range: string;
  timestamp: string;
  eventType: 'edit' | 'insert' | 'delete';
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const payload: WebhookPayload = await request.json();
    
    console.log('🔔 Webhook recibido:', {
      sheetId: payload.sheetId,
      range: payload.range,
      eventType: payload.eventType,
      timestamp: payload.timestamp
    });

    // Validar que el webhook viene de Google Apps Script
    const secretToken = request.headers.get('X-Secret-Token');
    const expectedToken = process.env.WEBHOOK_SECRET_TOKEN;
    
    if (!expectedToken) {
      console.warn('⚠️ WEBHOOK_SECRET_TOKEN no configurado');
    } else if (secretToken !== expectedToken) {
      console.warn('⚠️ Token de webhook inválido');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Procesar el evento según el tipo
    switch (payload.eventType) {
      case 'edit':
        console.log('📝 Sheet editado:', payload.range);
        break;
      case 'insert':
        console.log('➕ Fila insertada:', payload.range);
        break;
      case 'delete':
        console.log('🗑️ Fila eliminada:', payload.range);
        break;
    }

    // Enviar notificación en tiempo real a todas las conexiones activas
    broadcastToConnections({
      type: 'sheet-updated',
      data: payload,
      timestamp: new Date().toISOString()
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook procesado correctamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error procesando webhook:', error);
    return NextResponse.json(
      { error: 'Error procesando webhook' },
      { status: 500 }
    );
  }
}

// También manejar GET para verificar que el endpoint funciona
export async function GET() {
  return NextResponse.json({ 
    message: 'Webhook endpoint activo',
    timestamp: new Date().toISOString()
  });
}
