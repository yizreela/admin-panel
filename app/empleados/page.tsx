import Papa from "papaparse";
import EmployeeManagement from "../../src/components/EmployeeManagement";
import { Employee } from "../../src/components/EmployeeTable";
import LogoutButton from "../../src/components/LogoutButton";

async function fetchEmployees(): Promise<Employee[]> {
	const baseUrl = process.env.EMPLOYEES_SHEET_CSV_URL || process.env.NEXT_PUBLIC_EMPLOYEES_SHEET_CSV_URL;
	if (!baseUrl) return [];
	
	const url = new URL(baseUrl);
	url.searchParams.set("cb", Date.now().toString());
	const res = await fetch(url.toString(), { cache: "no-store" });
	if (!res.ok) return [];
	
	const text = await res.text();
	const parsed = Papa.parse<Employee>(text, { header: true, skipEmptyLines: true });
	
	return (parsed.data || [])
		.filter(Boolean)
		.filter(emp => emp.Estado !== 'Eliminado') // Filter out deleted employees
		.map((emp, index) => ({
			...emp,
			id: emp.Email || `emp-${index}`,
		}));
}

export default async function EmpleadosPage() {
	const employees = await fetchEmployees();
	const sheetConfigured = Boolean(process.env.EMPLOYEES_SHEET_CSV_URL || process.env.NEXT_PUBLIC_EMPLOYEES_SHEET_CSV_URL);

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="space-y-8">
					{!sheetConfigured && (
						<div className="bg-red-50 border border-red-200 rounded-xl p-4">
							<div className="flex items-center gap-3">
								<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
								<div>
									<div className="font-medium text-red-800">Configuración requerida</div>
									<div className="text-sm text-red-700">Falta configurar la variable de entorno <code className="bg-red-100 px-1 rounded">EMPLOYEES_SHEET_CSV_URL</code> con el enlace CSV de tu Google Sheet</div>
								</div>
							</div>
						</div>
					)}

					{/* Employee Management - TABLA PRIMERO */}
					<EmployeeManagement initialEmployees={employees} />
				</div>
			</div>
		</div>
	);
}
