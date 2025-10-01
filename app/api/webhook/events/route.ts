import { NextRequest } from 'next/server';

// Store para mantener las conexiones SSE activas
const connections = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      // Agregar esta conexión al store
      connections.add(controller);
      
      // Enviar mensaje de conexión
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({
        type: 'connected',
        timestamp: new Date().toISOString()
      })}\n\n`));
      
      console.log('🔗 Nueva conexión SSE establecida');
      
      // Configurar cleanup cuando se cierre la conexión
      request.signal.addEventListener('abort', () => {
        connections.delete(controller);
        console.log('🔌 Conexión SSE cerrada');
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}

// Función para broadcast a todas las conexiones activas
export function broadcastToConnections(data: any) {
  const encoder = new TextEncoder();
  const message = `data: ${JSON.stringify(data)}\n\n`;
  
  connections.forEach(controller => {
    try {
      controller.enqueue(encoder.encode(message));
    } catch (error) {
      console.error('❌ Error enviando a conexión:', error);
      connections.delete(controller);
    }
  });
  
  console.log(`📡 Broadcast enviado a ${connections.size} conexiones`);
}
