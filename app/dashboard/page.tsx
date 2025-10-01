import Papa from "papaparse";
import DashboardPanel from "../../src/components/DashboardPanel";
import AuthenticatedNav from "../../src/components/AuthenticatedNav";

type Row = {
  GroupId?: string;
  Solicitante?: string;
  Candidato?: string;
  MensajeOriginal?: string;
};

function getValue(obj: Record<string, unknown>, keys: string[], fallback = "") {
  for (const key of keys) {
    const v = obj[key];
    if (typeof v === "string" && v.trim().length > 0) return v.trim();
  }
  return fallback;
}

async function fetchCsv(): Promise<Row[]> {
  const baseUrl = process.env.DASHBOARD_SHEET_CSV_URL || process.env.NEXT_PUBLIC_DASHBOARD_SHEET_CSV_URL;
  if (!baseUrl) return [];
  const url = new URL(baseUrl);
  url.searchParams.set("cb", Date.now().toString());
  const res = await fetch(url.toString(), { cache: "no-store" });
  if (!res.ok) return [];
  const text = await res.text();
  const parsed = Papa.parse<Row>(text, { header: true, skipEmptyLines: true });
  return (parsed.data || []).filter(Boolean);
}

function normalizeData(rows: Row[]) {
  return rows.map(row => ({
    GroupId: getValue(row, ["GroupId", "groupid"], ""),
    Solicitante: getValue(row, ["Solicitante", "solicitante"], ""),
    Candidato: getValue(row, ["Candidato", "candidato"], ""),
    MensajeOriginal: getValue(row, ["MensajeOriginal", "mensajeoriginal"], "")
  }));
}

export default async function DashboardPage() {
  const rows = await fetchCsv();
  const normalizedData = normalizeData(rows);
  const sheetConfigured = Boolean(process.env.DASHBOARD_SHEET_CSV_URL || process.env.NEXT_PUBLIC_DASHBOARD_SHEET_CSV_URL);

  if (!sheetConfigured) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AuthenticatedNav />
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <div className="font-medium text-red-800">Configuración requerida</div>
                <div className="text-sm text-red-700">Falta configurar la variable de entorno <code className="bg-red-100 px-1 rounded">DASHBOARD_SHEET_CSV_URL</code> con el enlace CSV de tu Google Sheet</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthenticatedNav />
      <DashboardPanel data={normalizedData} />
    </div>
  );
}
