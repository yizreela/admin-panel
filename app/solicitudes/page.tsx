import Papa from "papaparse";
import SolicitudesTable, { type SolicitudRow } from "../../src/components/SolicitudesTable";
import SolicitudesWrapper from "../../src/components/SolicitudesWrapper";

type Row = {
	Fecha?: string;
	fecha?: string;
	Usuario?: string;
	usuario?: string;
	skill?: string;
	Skill?: string;
	mensaje_original?: string;
	Mensaje_original?: string;
};

function getValue(obj: Record<string, unknown>, keys: string[], fallback = "") {
	for (const key of keys) {
		const v = obj[key];
		if (typeof v === "string" && v.trim().length > 0) return v.trim();
	}
	return fallback;
}

async function fetchCsv(): Promise<Row[]> {
	const baseUrl = process.env.SHEET_CSV_URL || process.env.NEXT_PUBLIC_SHEET_CSV_URL;
	if (!baseUrl) return [];
	const url = new URL(baseUrl);
	url.searchParams.set("cb", Date.now().toString());
	const res = await fetch(url.toString(), { cache: "no-store" });
	if (!res.ok) return [];
	const text = await res.text();
	const parsed = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });
	return (parsed.data || []).filter(Boolean);
}

function aggregate(rows: Row[]) {
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

export default async function SolicitudesPage() {
	const rows = await fetchCsv();
	const { skillToUserCount, skillTotals } = aggregate(rows);

	const topSkills = Array.from(skillTotals.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, 5);

	const tableRows: SolicitudRow[] = [];
	for (const [skill, usersMap] of skillToUserCount.entries()) {
		for (const [user, count] of usersMap.entries()) {
			tableRows.push({ skill, user, count });
		}
	}

	const sheetConfigured = Boolean(process.env.SHEET_CSV_URL || process.env.NEXT_PUBLIC_SHEET_CSV_URL);

	return (
		<SolicitudesWrapper>
			<div className="text-right mb-6">
				<div className="text-sm text-gray-500">Total registros</div>
				<div className="text-2xl font-bold text-gray-900">{rows.length}</div>
			</div>

					{!sheetConfigured && (
						<div className="bg-red-50 border border-red-200 rounded-xl p-4">
							<div className="flex items-center gap-3">
								<svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
								<div>
									<div className="font-medium text-red-800">Configuración requerida</div>
									<div className="text-sm text-red-700">Falta configurar la variable de entorno <code className="bg-red-100 px-1 rounded">SHEET_CSV_URL</code> con el enlace CSV de tu Google Sheet</div>
								</div>
							</div>
						</div>
					)}

					{/* Top Skills */}
					<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
		</SolicitudesWrapper>
	);
}