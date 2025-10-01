"use client";

import { useMemo, useState } from "react";

export type Employee = {
	id?: string;
	Nombre: string;
	Email: string;
	Puesto: string;
	Seniority: string;
	"Proyecto Actual": string;
	Skills: string;
	CV: string;
	Estado?: string;
};

type Props = {
	employees: Employee[];
	onEdit: (employee: Employee) => void;
	onDelete: (id: string) => void;
	permissions?: {
		canEdit: boolean;
		canDelete: boolean;
	};
};

export default function EmployeeTable({ employees, onEdit, onDelete, permissions }: Props) {
	const [query, setQuery] = useState("");
	const [sortField, setSortField] = useState<keyof Employee>("Nombre");
	const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

	const filteredAndSorted = useMemo(() => {
		let filtered = employees;
		
		if (query.trim()) {
			const q = query.trim().toLowerCase();
			filtered = employees.filter(emp => 
				emp.Nombre.toLowerCase().includes(q) ||
				emp.Email.toLowerCase().includes(q) ||
				emp.Puesto.toLowerCase().includes(q) ||
				emp.Seniority.toLowerCase().includes(q) ||
				emp["Proyecto Actual"].toLowerCase().includes(q) ||
				emp.Skills.toLowerCase().includes(q)
			);
		}

		return filtered.sort((a, b) => {
			const aVal = a[sortField] || "";
			const bVal = b[sortField] || "";
			const comparison = aVal.localeCompare(bVal);
			return sortDirection === "asc" ? comparison : -comparison;
		});
	}, [employees, query, sortField, sortDirection]);

	const handleSort = (field: keyof Employee) => {
		if (sortField === field) {
			setSortDirection(sortDirection === "asc" ? "desc" : "asc");
		} else {
			setSortField(field);
			setSortDirection("asc");
		}
	};

	return (
		<div className="space-y-4">
			{/* Search */}
			<div className="flex items-center gap-3">
				<div className="relative flex-1 max-w-md">
					<svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
					<input
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Buscar empleados..."
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
					Mostrando {filteredAndSorted.length} de {employees.length} empleados
				</div>
			)}

			{/* Table */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="min-w-full">
						<thead className="bg-gradient-to-r from-gray-50 to-gray-100">
							<tr>
								<th 
									className="text-left px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
									onClick={() => handleSort("Nombre")}
								>
									<div className="flex items-center gap-2">
										<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
										</svg>
										Nombre
										{sortField === "Nombre" && (
											<svg className={`w-4 h-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
											</svg>
										)}
									</div>
								</th>
								<th 
									className="text-left px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
									onClick={() => handleSort("Email")}
								>
									<div className="flex items-center gap-2">
										<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
										Email
										{sortField === "Email" && (
											<svg className={`w-4 h-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
											</svg>
										)}
									</div>
								</th>
								<th 
									className="text-left px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
									onClick={() => handleSort("Puesto")}
								>
									<div className="flex items-center gap-2">
										<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6" />
										</svg>
										Puesto
										{sortField === "Puesto" && (
											<svg className={`w-4 h-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
											</svg>
										)}
									</div>
								</th>
								<th 
									className="text-left px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
									onClick={() => handleSort("Seniority")}
								>
									<div className="flex items-center gap-2">
										<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
										</svg>
										Seniority
										{sortField === "Seniority" && (
											<svg className={`w-4 h-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
											</svg>
										)}
									</div>
								</th>
								<th 
									className="text-left px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
									onClick={() => handleSort("Proyecto Actual")}
								>
									<div className="flex items-center gap-2">
										<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
										</svg>
										Proyecto
										{sortField === "Proyecto Actual" && (
											<svg className={`w-4 h-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
											</svg>
										)}
									</div>
								</th>
								<th 
									className="text-left px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
									onClick={() => handleSort("Skills")}
								>
									<div className="flex items-center gap-2">
										<svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
										</svg>
										Skills
										{sortField === "Skills" && (
											<svg className={`w-4 h-4 ${sortDirection === "asc" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
											</svg>
										)}
									</div>
								</th>
								<th className="text-center px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wider">
									Acciones
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{filteredAndSorted.length === 0 && (
								<tr>
									<td colSpan={7} className="px-6 py-12 text-center">
										<div className="flex flex-col items-center gap-3">
											<svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
											</svg>
											<span className="text-gray-500 text-sm">Sin empleados disponibles</span>
										</div>
									</td>
								</tr>
							)}
							{filteredAndSorted.map((employee, index) => (
								<tr key={`${employee.Email}-${index}`} className="hover:bg-gray-50 transition-colors duration-150">
									<td className="px-6 py-4">
										<div className="font-medium text-gray-900">{employee.Nombre}</div>
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">{employee.Email}</td>
									<td className="px-6 py-4">
										<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
											{employee.Puesto}
										</span>
									</td>
									<td className="px-6 py-4">
										<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
											employee.Seniority === "Senior" ? "bg-green-100 text-green-800" :
											employee.Seniority === "Mid" ? "bg-yellow-100 text-yellow-800" :
											"bg-gray-100 text-gray-800"
										}`}>
											{employee.Seniority}
										</span>
									</td>
									<td className="px-6 py-4 text-sm text-gray-600">{employee["Proyecto Actual"]}</td>
									<td className="px-6 py-4">
										<div className="flex flex-wrap gap-1">
											{employee.Skills.split(",").map((skill, idx) => (
												<span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
													{skill.trim()}
												</span>
											))}
										</div>
									</td>
									<td className="px-6 py-4 text-center">
										<div className="flex items-center justify-center gap-2">
											{permissions?.canEdit ? (
												<button
													onClick={() => onEdit(employee)}
													className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
													title="Editar"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</button>
											) : (
												<div className="p-2 text-gray-400 opacity-50" title="Sin permisos para editar">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
													</svg>
												</div>
											)}
											{permissions?.canDelete ? (
												<button
													onClick={() => onDelete(employee.Email)}
													className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
													title="Eliminar"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</button>
											) : (
												<div className="p-2 text-gray-400 opacity-50" title="Sin permisos para eliminar">
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
												</div>
											)}
											{employee.CV && (
												<a
													href={employee.CV}
													target="_blank"
													rel="noopener noreferrer"
													className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
													title="Ver CV"
												>
													<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
													</svg>
												</a>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
