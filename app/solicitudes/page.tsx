import SolicitudesPanel from "../../src/components/SolicitudesPanel";
import AuthenticatedNav from "../../src/components/AuthenticatedNav";

export default async function SolicitudesPage() {
	const sheetConfigured = Boolean(process.env.SHEET_CSV_URL || process.env.NEXT_PUBLIC_SHEET_CSV_URL);

	// Obtener datos iniciales del API
	const response = await fetch(`${process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'}/api/solicitudes`, {
		cache: 'no-store'
	});
	
	let initialData = [];
	if (response.ok) {
		const result = await response.json();
		initialData = result.data || [];
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<AuthenticatedNav />
			<SolicitudesPanel data={initialData} />
		</div>
	);
}