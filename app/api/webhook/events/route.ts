import { NextRequest } from 'next/server';

// Store para mantener las conexiones SSE activas
const connections = new Set<ReadableStreamDefaultController>();

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      try {
        // Agregar esta conexión al store
        connections.add(controller);
        
        // Enviar mensaje de conexión inicial
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({
          type: 'connected',
          timestamp: new Date().toISOString()
        })}\n\n`));
        
        console.log('🔗 Nueva conexión SSE establecida');
        
        // Enviar heartbeat cada 300 segundos (5 minutos) para mantener la conexión
        const heartbeat = setInterval(() => {
          try {
            if (connections.has(controller)) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                type: 'heartbeat',
                timestamp: new Date().toISOString()
              })}\n\n`));
            } else {
              clearInterval(heartbeat);
            }
          } catch (error) {
            console.log('❌ Error en heartbeat, cerrando conexión');
            clearInterval(heartbeat);
            connections.delete(controller);
          }
        }, 300000);
        
        // Configurar cleanup cuando se cierre la conexión
        request.signal.addEventListener('abort', () => {
          clearInterval(heartbeat);
          connections.delete(controller);
          console.log('🔌 Conexión SSE cerrada');
        });
        
      } catch (error) {
        console.error('❌ Error estableciendo conexión SSE:', error);
        connections.delete(controller);
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
      'X-Accel-Buffering': 'no'
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
