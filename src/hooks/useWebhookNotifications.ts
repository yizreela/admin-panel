'use client';

import { useState, useEffect, useCallback } from 'react';

interface WebhookNotification {
  sheetId: string;
  range: string;
  eventType: 'edit' | 'insert' | 'delete';
  timestamp: string;
}

export function useWebhookNotifications() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState<WebhookNotification | null>(null);
  const [notifications, setNotifications] = useState<WebhookNotification[]>([]);

  const handleNotification = useCallback((notification: WebhookNotification) => {
    console.log('🔔 Notificación recibida:', notification);
    setLastNotification(notification);
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Mantener solo las últimas 10
  }, []);

  useEffect(() => {
    // Crear conexión Server-Sent Events
    const eventSource = new EventSource('/api/webhook/events');
    
    eventSource.onopen = () => {
      console.log('🔗 Conectado a webhook notifications');
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const notification: WebhookNotification = JSON.parse(event.data);
        handleNotification(notification);
      } catch (error) {
        console.error('❌ Error parseando notificación:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('❌ Error en SSE:', error);
      setIsConnected(false);
    };

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [handleNotification]);

  return {
    isConnected,
    lastNotification,
    notifications,
    clearNotifications: () => setNotifications([])
  };
}
