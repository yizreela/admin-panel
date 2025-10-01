'use client';

import { useState, useMemo, useEffect } from 'react';
import { useWebhookNotifications } from '../hooks/useWebhookNotifications';

type DashboardData = {
  GroupId: string;
  Solicitante: string;
  Candidato: string;
  MensajeOriginal: string;
};

type DashboardPanelProps = {
  data: DashboardData[];
};

export default function DashboardPanel({ data }: DashboardPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSolicitante, setSelectedSolicitante] = useState('');

  // Webhook notifications para actualizaciones automáticas del sheet
  const { isConnected, lastNotification } = useWebhookNotifications();

  // Manejar notificaciones de webhook
  useEffect(() => {
    if (lastNotification) {
      console.log('🔄 Dashboard sheet actualizado, recargando página...');
      window.location.reload();
    }
  }, [lastNotification]);

  // Obtener solicitantes únicos para el filtro
  const uniqueSolicitantes = useMemo(() => {
    const solicitantes = [...new Set(data.map(item => item.Solicitante))];
    return solicitantes.sort();
  }, [data]);

  // Filtrar datos
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.Solicitante.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.Candidato.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.MensajeOriginal.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesSolicitante = selectedSolicitante === '' || item.Solicitante === selectedSolicitante;
      
      return matchesSearch && matchesSolicitante;
    });
  }, [data, searchQuery, selectedSolicitante]);

  // Estadísticas
  const stats = useMemo(() => {
    const totalSolicitudes = data.length;
    const solicitantesUnicos = uniqueSolicitantes.length;
    
    // Top 5 candidatos más sugeridos
    const candidatoCounts = data.reduce((acc, item) => {
      acc[item.Candidato] = (acc[item.Candidato] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topCandidatos = Object.entries(candidatoCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5);

    // Top 3 habilidades más demandadas (MensajeOriginal)
    const habilidadCounts = data.reduce((acc, item) => {
      acc[item.MensajeOriginal] = (acc[item.MensajeOriginal] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const topHabilidades = Object.entries(habilidadCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);

    return {
      totalSolicitudes,
      solicitantesUnicos,
      topCandidatos,
      topHabilidades
    };
  }, [data, uniqueSolicitantes]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v6a2 2 0 01-2 2h-2a2 2 0 01-2-2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard de Solicitudes</h1>
                  <p className="text-gray-600">Mensajes enviados al robot y candidatos sugeridos</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total solicitudes</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalSolicitudes}</div>
                
                {/* Indicador de webhook */}
                <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-500">
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
            </div>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Total Solicitudes</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalSolicitudes}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Solicitantes Únicos</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.solicitantesUnicos}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Top 5 Candidatos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Top 5 Candidatos Más Sugeridos</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.topCandidatos.map(([candidato, count], index) => (
                <div key={candidato} className="flex items-center gap-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-orange-500 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{candidato}</div>
                    <div className="text-sm text-gray-600">{count} sugerencias</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 3 Habilidades */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Top 3 Habilidades Más Demandadas</h2>
            </div>
            <div className="flex flex-wrap gap-3">
              {stats.topHabilidades.map(([habilidad, count], index) => (
                <div key={habilidad} className="flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-3">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{habilidad}</div>
                    <div className="text-sm text-gray-600">{count} solicitudes</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Filtros</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Buscar</label>
                <input
                  type="text"
                  placeholder="Buscar en solicitantes, candidatos, habilidades..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Solicitante</label>
                <select
                  value={selectedSolicitante}
                  onChange={(e) => setSelectedSolicitante(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Todos los solicitantes</option>
                  {uniqueSolicitantes.map(solicitante => (
                    <option key={solicitante} value={solicitante}>{solicitante}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSolicitante('');
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>

          {/* Tabla de Solicitudes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Solicitudes ({filteredData.length})</h2>
              </div>
            </div>

            {filteredData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 text-lg">No se encontraron solicitudes con los filtros aplicados</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredData.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                      <div className="lg:col-span-1">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">GroupId:</span>
                            <span className="text-sm text-gray-900 font-mono">{item.GroupId}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Solicitante:</span>
                            <span className="text-sm font-semibold text-blue-600">{item.Solicitante}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-500">Candidato:</span>
                            <span className="text-sm font-semibold text-green-600">{item.Candidato}</span>
                          </div>
                        </div>
                      </div>
                      <div className="lg:col-span-3">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-500">Habilidad Demandada:</div>
                          <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg border">
                            {item.MensajeOriginal}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
