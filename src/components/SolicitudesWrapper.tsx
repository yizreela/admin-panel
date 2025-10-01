'use client';

import LogoutButton from './LogoutButton';

type SolicitudesWrapperProps = {
  children: React.ReactNode;
};

export default function SolicitudesWrapper({ children }: SolicitudesWrapperProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Header con logout */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Solicitudes</h1>
                  <p className="text-gray-600">Análisis de skills más demandadas por usuario</p>
                </div>
              </div>
              <LogoutButton />
            </div>
          </div>
          
          {/* Contenido de la página */}
          {children}
        </div>
      </div>
    </div>
  );
}
