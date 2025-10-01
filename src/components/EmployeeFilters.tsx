"use client";

import { useState } from "react";
import { Employee } from "./EmployeeTable";

type Props = {
	employees: Employee[];
	onFilter: (filtered: Employee[]) => void;
};

export default function EmployeeFilters({ employees, onFilter }: Props) {
	const [filters, setFilters] = useState({
		puesto: "",
		seniority: "",
		proyecto: "",
		skills: "",
	});

	const handleFilterChange = (key: string, value: string) => {
		const newFilters = { ...filters, [key]: value };
		setFilters(newFilters);
		applyFilters(newFilters);
	};

	const applyFilters = (filterValues: typeof filters) => {
		let filtered = employees;

		if (filterValues.puesto) {
			filtered = filtered.filter(emp => 
				emp.Puesto.toLowerCase().includes(filterValues.puesto.toLowerCase())
			);
		}

		if (filterValues.seniority) {
			filtered = filtered.filter(emp => 
				emp.Seniority.toLowerCase().includes(filterValues.seniority.toLowerCase())
			);
		}

		if (filterValues.proyecto) {
			filtered = filtered.filter(emp => 
				emp["Proyecto Actual"].toLowerCase().includes(filterValues.proyecto.toLowerCase())
			);
		}

		if (filterValues.skills) {
			filtered = filtered.filter(emp => 
				emp.Skills.toLowerCase().includes(filterValues.skills.toLowerCase())
			);
		}

		onFilter(filtered);
	};

	const clearFilters = () => {
		const emptyFilters = { puesto: "", seniority: "", proyecto: "", skills: "" };
		setFilters(emptyFilters);
		onFilter(employees);
	};

	// Get unique values for dropdowns
	const uniquePuestos = [...new Set(employees.map(emp => emp.Puesto))].filter(Boolean);
	const uniqueSeniority = [...new Set(employees.map(emp => emp.Seniority))].filter(Boolean);
	const uniqueProyectos = [...new Set(employees.map(emp => emp["Proyecto Actual"]))].filter(Boolean);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
			<div className="flex items-center justify-between mb-3">
				<div className="flex items-center gap-2">
					<div className="p-1.5 bg-blue-100 rounded-lg">
						<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
						</svg>
					</div>
					<div>
						<h3 className="text-sm font-semibold text-gray-900">Filtros</h3>
						<p className="text-xs text-gray-600">Buscar empleados</p>
					</div>
				</div>
				<button
					onClick={clearFilters}
					className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100"
				>
					Limpiar
				</button>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
				{/* Puesto Filter */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Puesto</label>
					<select
						value={filters.puesto}
						onChange={(e) => handleFilterChange('puesto', e.target.value)}
						className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="">Todos los puestos</option>
						{uniquePuestos.map(puesto => (
							<option key={puesto} value={puesto}>{puesto}</option>
						))}
					</select>
				</div>

				{/* Seniority Filter */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Seniority</label>
					<select
						value={filters.seniority}
						onChange={(e) => handleFilterChange('seniority', e.target.value)}
						className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="">Todos los niveles</option>
						{uniqueSeniority.map(seniority => (
							<option key={seniority} value={seniority}>{seniority}</option>
						))}
					</select>
				</div>

				{/* Proyecto Filter */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Proyecto</label>
					<select
						value={filters.proyecto}
						onChange={(e) => handleFilterChange('proyecto', e.target.value)}
						className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					>
						<option value="">Todos los proyectos</option>
						{uniqueProyectos.map(proyecto => (
							<option key={proyecto} value={proyecto}>{proyecto}</option>
						))}
					</select>
				</div>

				{/* Skills Filter */}
				<div>
					<label className="block text-xs font-medium text-gray-700 mb-1">Skills</label>
					<input
						type="text"
						value={filters.skills}
						onChange={(e) => handleFilterChange('skills', e.target.value)}
						placeholder="Buscar por skills..."
						className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					/>
				</div>
			</div>
		</div>
	);
}