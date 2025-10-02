'use client';
import { useState, useMemo, useEffect } from 'react';
import { useWebhookNotifications } from '../hooks/useWebhookNotifications';
import SolicitudesTable, { type SolicitudRow } from './SolicitudesTable';

interface SolicitudesPanelProps {
  data: Array<{
    Fecha: string;
    usuario: string;
    skill: string;
    mensaje_original: string;
  }>;
}

function getValue(obj: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return fallback;
}

function aggregate(rows: Array<{ Fecha: string; usuario: string; skill: string; mensaje_original: string }>) {
  const skillToUserCount = new Map<string, Map<string, number>>();
  const skillTotals = new Map<string, number>();

  for (const row of rows) {
    const skill = getValue(row as any, ["skill", "Skill"], "(Sin skill)");
    const user = getValue(row as any, ["usuario", "Usuario"], "(Sin usuario)");
    if (!skillToUserCount.has(skill)) skillToUserCount.set(skill, new Map());
    const map = skillToUserCount.get(skill)!;
    map.set(user, (map.get(user) || 0) + 1);
    skillTotals.set(skill, (skillTotals.get(skill) || 0) + 1);
  }

  return { skillToUserCount, skillTotals };
}

export default function SolicitudesPanel({ data: initialData }: SolicitudesPanelProps) {
  const [data, setData] = useState(initialData);
  const { isConnected, lastNotification } = useWebhookNotifications();

  // Función para refrescar datos
  const refreshData = async () => {
    try {
      const response = await fetch('/api/solicitudes');
      const result = await response.json();
      if (result.success) {
        setData(result.data);
        console.log('📋 Solicitudes data refreshed');
      }
    } catch (error) {
      console.error('Error refreshing solicitudes data:', error);
    }
  };

  // Manejar notificaciones de webhook
  useEffect(() => {
    if (lastNotification) {
      console.log('🔄 Solicitudes sheet actualizado, refrescando datos...');
      refreshData();
    }
  }, [lastNotification]);

  const { skillToUserCount, skillTotals } = aggregate(data);

  const topSkills = Array.from(skillTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const tableRows: SolicitudRow[] = [];
  for (const [skill, usersMap] of skillToUserCount.entries()) {
    for (const [user, count] of usersMap.entries()) {
      tableRows.push({ skill, user, count });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header con indicador de conexión */}
      <div className="flex justify-between items-center mb-6">
        <div className="text-right">
          <div className="text-sm text-gray-500">Total registros</div>
          <div className="text-2xl font-bold text-gray-900">{data.length}</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {isConnected && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Conectado en tiempo real</span>
            </div>
          )}
          {lastNotification && (
            <span className="text-gray-400">
              Última actualización: {new Date(lastNotification.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Top Skills */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-green-100 rounded-lg">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Top 5 Skills Más Demandadas</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          {topSkills.length === 0 && (
            <div className="text-gray-500 text-sm">Sin datos disponibles</div>
          )}
          {topSkills.map(([skill, count], index) => (
            <div key={skill} className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                {index + 1}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{skill}</div>
                <div className="text-sm text-gray-600">{count} solicitudes</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900">Detalle por Skill y Usuario</h2>
        </div>
        <SolicitudesTable rows={tableRows} />
      </div>
    </div>
  );
}
