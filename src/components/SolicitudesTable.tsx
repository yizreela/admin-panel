"use client";

import { useMemo, useState } from "react";

export type SolicitudRow = {
	skill: string;
	user: string;
	count: number;
};

type Props = {
	rows: SolicitudRow[];
};

export default function SolicitudesTable({ rows }: Props) {
	const [query, setQuery] = useState("");

	const filtered = useMemo(() => {
		if (!query.trim()) return rows;
		const q = query.trim().toLowerCase();
		return rows.filter((r) => r.skill.toLowerCase().includes(q) || r.user.toLowerCase().includes(q));
	}, [rows, query]);

	const grouped = useMemo(() => {
		const map = new Map<string, SolicitudRow[]>();
		for (const r of filtered) {
			if (!map.has(r.skill)) map.set(r.skill, []);
			map.get(r.skill)!.push(r);
		}
		const totals = new Map<string, number>();
		for (const r of filtered) totals.set(r.skill, (totals.get(r.skill) || 0) + r.count);
		const skills = Array.from(map.keys()).sort((a, b) => {
			const ta = totals.get(a) || 0;
			const tb = totals.get(b) || 0;
			if (tb !== ta) return tb - ta;
			return a.localeCompare(b);
		});
		return { map, skills };
	}, [filtered]);

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-md">
					<svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Buscar por skill o usuario..."
						className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
					/>
				</div>
				{query && (
					<button 
						onClick={() => setQuery("")} 
						className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
					>
						<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
						Limpiar
					</button>
				)}
			</div>

			{query && (
				<div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
					Mostrando {filtered.length} de {rows.length} resultados
				</div>
			)}

			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead className="bg-gradient-to-r from-gray-50 to-gray-100">
							<tr>
								<th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
									<div className="flex items-center gap-2">
										<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
										</svg>
										Skill
									</div>
								</th>
								<th className="text-left px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
									<div className="flex items-center gap-2">
										<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										Usuario
									</div>
								</th>
								<th className="text-right px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
									<div className="flex items-center justify-end gap-2">
										<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
										</svg>
										Veces
									</div>
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{grouped.skills.length === 0 && (
								<tr>
									<td colSpan={3} className="px-6 py-12 text-center">
										<div className="flex flex-col items-center gap-3">
											<svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
											</svg>
											<span className="text-gray-500 text-sm">Sin datos disponibles</span>
										</div>
									</td>
								</tr>
							)}
							{grouped.skills.map((skill) => {
								const rowsForSkill = (grouped.map.get(skill) || []).slice().sort((a, b) => b.count - a.count || a.user.localeCompare(b.user));
								return rowsForSkill.map((r, idx) => (
									<tr key={`${skill}_${r.user}`} className="hover:bg-gray-50 transition-colors duration-150">
										<td className="px-6 py-4 align-top">
											{idx === 0 ? (
												<div className="flex items-center gap-2">
													<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
														{skill}
													</span>
												</div>
											) : null}
										</td>
										<td className="px-6 py-4 text-sm text-gray-900">{r.user}</td>
										<td className="px-6 py-4 text-right">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
												{r.count}
											</span>
										</td>
									</tr>
								));
							})}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
