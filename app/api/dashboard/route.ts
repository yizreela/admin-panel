import Papa from "papaparse";

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

export async function GET() {
  try {
    const rows = await fetchCsv();
    const normalizedData = normalizeData(rows);
    
    return Response.json({
      success: true,
      data: normalizedData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return Response.json({
      success: false,
      error: 'Error fetching dashboard data',
      data: []
    }, { status: 500 });
  }
}
