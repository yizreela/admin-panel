export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">📊 Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Tarjeta 1 */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Total Solicitudes</h2>
          <p className="text-2xl font-bold text-blue-600">42</p>
        </div>

        {/* Tarjeta 2 */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Habilidades más pedidas</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>React</li>
            <li>Python</li>
            <li>Node.js</li>
          </ul>
        </div>

        {/* Tarjeta 3 */}
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Empleados más sugeridos</h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>Ana Torres</li>
            <li>Luis Peña</li>
            <li>Carlos Ruiz</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
