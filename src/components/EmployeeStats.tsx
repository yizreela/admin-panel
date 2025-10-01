"use client";

import { useMemo } from "react";
import { Employee } from "./EmployeeTable";

type Props = {
	employees: Employee[];
};

export default function EmployeeStats({ employees }: Props) {
	const stats = useMemo(() => {
		const total = employees.length;
		
		// Puesto distribution
		const puestos = employees.reduce((acc, emp) => {
			acc[emp.Puesto] = (acc[emp.Puesto] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Seniority distribution
		const seniority = employees.reduce((acc, emp) => {
			acc[emp.Seniority] = (acc[emp.Seniority] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);

		// Skills analysis
		const allSkills = employees.flatMap(emp => 
			emp.Skills.split(",").map(skill => skill.trim()).filter(Boolean)
		);
		const skillCounts = allSkills.reduce((acc, skill) => {
			acc[skill] = (acc[skill] || 0) + 1;
			return acc;
		}, {} as Record<string, number>);
		const topSkills = Object.entries(skillCounts)
			.sort(([,a], [,b]) => b - a)
			.slice(0, 5);

		return {
			total,
			puestos,
			seniority,
			topSkills,
		};
	}, [employees]);

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
			<div className="flex items-center gap-2 mb-3">
				<div className="p-1.5 bg-indigo-100 rounded-lg">
					<svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
					</svg>
				</div>
				<div>
					<h3 className="text-base font-semibold text-gray-900">Estadísticas</h3>
					<p className="text-xs text-gray-600">Métricas del equipo</p>
				</div>
			</div>

			<div className="grid grid-cols-2 md:grid-cols-4 gap-2">
				{/* Total Employees */}
				<div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-2 border border-blue-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-xs font-medium text-blue-600">Total</p>
							<p className="text-lg font-bold text-blue-900">{stats.total}</p>
						</div>
						<div className="p-1 bg-blue-200 rounded">
							<svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
							</svg>
						</div>
					</div>
				</div>

				{/* Puesto Distribution */}
				<div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-2 border border-green-200">
					<div>
						<p className="text-xs font-medium text-green-600">Puestos</p>
						<div className="text-xs text-green-900 mt-1 space-y-0.5">
							{Object.entries(stats.puestos).length > 0 ? (
								Object.entries(stats.puestos).slice(0, 3).map(([puesto, count]) => (
									<div key={puesto} className="flex justify-between items-center">
										<span className="truncate">{puesto}</span>
										<span className="font-bold text-xs bg-green-200 px-1.5 py-0.5 rounded-full">{count}</span>
									</div>
								))
							) : (
								<div className="text-xs text-green-700">No hay puestos</div>
							)}
							{Object.entries(stats.puestos).length > 3 && (
								<div className="relative group">
									<div className="text-xs text-green-600 font-medium cursor-help">
										+{Object.entries(stats.puestos).length - 3} más
									</div>
									<div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg min-w-max">
										<div className="space-y-1">
											{Object.entries(stats.puestos).slice(3).map(([puesto, count]) => (
												<div key={puesto} className="flex justify-between items-center gap-2">
													<span>{puesto}</span>
													<span className="font-bold bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full">{count}</span>
												</div>
											))}
										</div>
										<div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Seniority Distribution */}
				<div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-2 border border-purple-200">
					<div>
						<p className="text-xs font-medium text-purple-600">Seniority</p>
						<div className="text-xs text-purple-900 mt-1 space-y-0.5">
							{Object.entries(stats.seniority).length > 0 ? (
								Object.entries(stats.seniority).slice(0, 3).map(([seniority, count]) => (
									<div key={seniority} className="flex justify-between items-center">
										<span className="truncate">{seniority}</span>
										<span className="font-bold text-xs bg-purple-200 px-1.5 py-0.5 rounded-full">{count}</span>
									</div>
								))
							) : (
								<div className="text-xs text-purple-700">No hay seniority</div>
							)}
							{Object.entries(stats.seniority).length > 3 && (
								<div className="relative group">
									<div className="text-xs text-purple-600 font-medium cursor-help">
										+{Object.entries(stats.seniority).length - 3} más
									</div>
									<div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg min-w-max">
										<div className="space-y-1">
											{Object.entries(stats.seniority).slice(3).map(([seniority, count]) => (
												<div key={seniority} className="flex justify-between items-center gap-2">
													<span>{seniority}</span>
													<span className="font-bold bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded-full">{count}</span>
												</div>
											))}
										</div>
										<div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Top 5 Skills */}
				<div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-2 border border-orange-200">
					<div>
						<p className="text-xs font-medium text-orange-600">Top Skills</p>
						<div className="text-xs text-orange-900 mt-1 space-y-0.5">
							{stats.topSkills.length > 0 ? (
								stats.topSkills.slice(0, 3).map(([skill, count]) => (
									<div key={skill} className="flex justify-between items-center">
										<span className="truncate">{skill}</span>
										<span className="font-bold text-xs bg-orange-200 px-1.5 py-0.5 rounded-full">{count}</span>
									</div>
								))
							) : (
								<div className="text-xs text-orange-700">No hay skills</div>
							)}
							{stats.topSkills.length > 3 && (
								<div className="relative group">
									<div className="text-xs text-orange-600 font-medium cursor-help">
										+{stats.topSkills.length - 3} más
									</div>
									<div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-10 bg-gray-900 text-white text-xs rounded-lg p-2 shadow-lg min-w-max">
										<div className="space-y-1">
											{stats.topSkills.slice(3).map(([skill, count]) => (
												<div key={skill} className="flex justify-between items-center gap-2">
													<span>{skill}</span>
													<span className="font-bold bg-orange-200 text-orange-800 px-1.5 py-0.5 rounded-full">{count}</span>
												</div>
											))}
										</div>
										<div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}