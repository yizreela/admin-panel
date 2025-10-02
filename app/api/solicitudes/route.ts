import Papa from "papaparse";

type Row = {
  Fecha?: string;
  usuario?: string;
  skill?: string;
  mensaje_original?: string;
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

function normalizeData(rows: Row[]) {
  return rows.map(row => ({
    Fecha: getValue(row, ["Fecha", "fecha"], ""),
    usuario: getValue(row, ["usuario", "Usuario"], ""),
    skill: getValue(row, ["skill", "Skill"], ""),
    mensaje_original: getValue(row, ["mensaje_original", "MensajeOriginal"], "")
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
    console.error('Error fetching solicitudes data:', error);
    return Response.json({
      success: false,
      error: 'Error fetching solicitudes data',
      data: []
    }, { status: 500 });
  }
}
