"use client";

import { useState, useEffect } from "react";
import EmployeeTable, { Employee } from "./EmployeeTable";
import EmployeeModal from "./EmployeeModal";
import CSVUpload from "./CSVUpload";
import EmployeeFilters from "./EmployeeFilters";
import EmployeeStats from "./EmployeeStats";
import LogoutButton from "./LogoutButton";
import { usePermissions } from "../hooks/usePermissions";

type Props = {
	initialEmployees: Employee[];
};

export default function EmployeeManagement({ initialEmployees }: Props) {
	const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
	const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>(initialEmployees);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isCSVModalOpen, setIsCSVModalOpen] = useState(false);
	const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const { permissions, userInfo } = usePermissions();

	// Update employees when initial data changes
	useEffect(() => {
		setEmployees(initialEmployees);
		setFilteredEmployees(initialEmployees);
	}, [initialEmployees]);

	// Function to refresh employees data
	const refreshEmployees = async () => {
		setIsLoading(true);
		try {
			const response = await fetch('/api/employees');
			if (response.ok) {
				const updatedEmployees = await response.json();
				setEmployees(updatedEmployees);
				setFilteredEmployees(updatedEmployees);
			}
		} catch (error) {
			console.error('Error refreshing employees:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleFilterChange = (filtered: Employee[]) => {
		setFilteredEmployees(filtered);
	};

	const handleExportCSV = () => {
		const headers = ["Nombre", "Email", "Puesto", "Seniority", "Proyecto Actual", "Skills", "CV"];
		const csvContent = [
			headers.join(","),
			...filteredEmployees.map(emp => [
				`"${emp.Nombre}"`,
				`"${emp.Email}"`,
				`"${emp.Puesto}"`,
				`"${emp.Seniority}"`,
				`"${emp["Proyecto Actual"]}"`,
				`"${emp.Skills}"`,
				`"${emp.CV || ""}"`
			].join(","))
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);
		link.setAttribute("href", url);
		link.setAttribute("download", `empleados_${new Date().toISOString().split('T')[0]}.csv`);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	};

	const handleAddEmployee = () => {
		setEditingEmployee(null);
		setIsModalOpen(true);
	};

	const handleEditEmployee = (employee: Employee) => {
		setEditingEmployee(employee);
		setIsModalOpen(true);
	};

	const handleDeleteEmployee = async (id: string) => {
		if (!confirm("¿Estás seguro de que quieres eliminar este empleado?")) return;

		setIsLoading(true);
		try {
			// Usar el nuevo endpoint de soft delete con PUT
			const response = await fetch(`/api/employees/delete?id=${id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				}
			});
			
			if (!response.ok) {
				const errorData = await response.json().catch(() => ({}));
				throw new Error(errorData.error || `Error del servidor: ${response.status}`);
			}
			
			// Refresh data from server
			await refreshEmployees();
			alert("Empleado marcado como eliminado correctamente");
		} catch (error) {
			console.error('Error deleting employee:', error);
			alert(`Error al eliminar empleado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
		} finally {
			setIsLoading(false);
		}
	};


	const handleSaveEmployee = async (employeeData: Employee) => {
		setIsLoading(true);
		try {
			if (editingEmployee) {
				// Update existing employee
				const response = await fetch('/api/employees', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ id: editingEmployee.Email, ...employeeData })
				});
				
				if (!response.ok) {
					throw new Error('Error updating employee');
				}
				
				alert("Empleado actualizado correctamente");
			} else {
				// Add new employee
				const response = await fetch('/api/employees', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(employeeData)
				});
				
				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || 'Error adding employee');
				}
				
				alert("Empleado agregado correctamente");
			}

			// Refresh data from server
			await refreshEmployees();
			setIsModalOpen(false);
		} catch (error) {
			console.error('Error saving employee:', error);
			alert(`Error al guardar empleado: ${error instanceof Error ? error.message : 'Error desconocido'}`);
		} finally {
			setIsLoading(false);
		}
	};

	const handleCSVUpload = async (csvData: any[]) => {
		// CSVUpload component now handles all the logic internally
		// We just need to refresh the data after processing
		await refreshEmployees();
		setIsCSVModalOpen(false);
	};

	return (
		<>
			{/* Action Panel - PRIMERO */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2">
						<div className="p-1.5 bg-green-100 rounded-lg">
							<svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
						</div>
						<div>
							<h3 className="text-base font-semibold text-gray-900">Acciones</h3>
							<p className="text-xs text-gray-600">Gestiona los empleados</p>
						</div>
					</div>
					<LogoutButton />
				</div>

				<div className="grid grid-cols-1 md:grid-cols-4 gap-3">
					{/* Add Employee */}
					{permissions.canAdd ? (
						<button 
							onClick={handleAddEmployee}
							className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
						>
						<div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
							<svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
							</svg>
						</div>
						<div className="text-left">
							<h4 className="text-sm font-medium text-blue-900">Agregar</h4>
							<p className="text-xs text-blue-700">Nuevo empleado</p>
						</div>
					</button>
					) : (
						<div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
							<div className="p-1.5 bg-gray-100 rounded-lg">
								<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
								</svg>
							</div>
							<div className="text-left">
								<h4 className="text-sm font-medium text-gray-500">Agregar</h4>
								<p className="text-xs text-gray-400">Sin permisos</p>
							</div>
						</div>
					)}

					{/* Upload CSV */}
					{permissions.canImport ? (
						<button 
							onClick={() => setIsCSVModalOpen(true)}
							className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group"
						>
						<div className="p-1.5 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
							<svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
							</svg>
						</div>
						<div className="text-left">
							<h4 className="text-sm font-medium text-green-900">Subir CSV</h4>
							<p className="text-xs text-green-700">Importar múltiples</p>
						</div>
					</button>
					) : (
						<div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
							<div className="p-1.5 bg-gray-100 rounded-lg">
								<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
								</svg>
							</div>
							<div className="text-left">
								<h4 className="text-sm font-medium text-gray-500">Subir CSV</h4>
								<p className="text-xs text-gray-400">Sin permisos</p>
							</div>
						</div>
					)}

					{/* Export CSV */}
					{permissions.canExport ? (
						<button 
							onClick={handleExportCSV}
							className="flex items-center gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors group"
						>
						<div className="p-1.5 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
							<svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<div className="text-left">
							<h4 className="text-sm font-medium text-purple-900">Exportar</h4>
							<p className="text-xs text-purple-700">Descargar datos</p>
						</div>
					</button>
					) : (
						<div className="flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-lg opacity-50">
							<div className="p-1.5 bg-gray-100 rounded-lg">
								<svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
							</div>
							<div className="text-left">
								<h4 className="text-sm font-medium text-gray-500">Exportar</h4>
								<p className="text-xs text-gray-400">Sin permisos</p>
							</div>
						</div>
					)}

					{/* Refresh Button */}
					<button 
						onClick={refreshEmployees}
						disabled={isLoading}
						className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors group disabled:opacity-50"
					>
						<div className="p-1.5 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
							<svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
							</svg>
						</div>
						<div className="text-left">
							<h4 className="text-sm font-medium text-green-900">
								{isLoading ? 'Actualizando...' : 'Actualizar'}
							</h4>
							<p className="text-xs text-green-700">Refrescar datos</p>
						</div>
					</button>
				</div>
			</div>

			{/* Statistics Dashboard - SEGUNDO (más compacto) */}
			<div className="mb-6">
				<EmployeeStats employees={employees} />
			</div>

			{/* Advanced Filters - TERCERO (más compacto) */}
			<div className="mb-6">
				<EmployeeFilters 
					employees={employees} 
					onFilter={handleFilterChange}
				/>
			</div>

			{/* Employee Table - CUARTO */}
			<div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
				<div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-100 rounded-lg">
								<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
							</div>
							<div>
								<h2 className="text-xl font-semibold text-gray-900">Lista de Empleados</h2>
								<p className="text-sm text-gray-600">
									{filteredEmployees.length} de {employees.length} empleados mostrados
								</p>
							</div>
						</div>
					</div>
				</div>
				
				<div className="p-6">
					<EmployeeTable 
						employees={filteredEmployees} 
						onEdit={handleEditEmployee}
						onDelete={handleDeleteEmployee}
						permissions={{
							canEdit: permissions.canEdit,
							canDelete: permissions.canDelete
						}}
					/>
				</div>
			</div>

			{/* Employee Modal */}
			{isModalOpen && (
				<EmployeeModal
					isOpen={isModalOpen}
					onClose={() => setIsModalOpen(false)}
					onSave={handleSaveEmployee}
					employee={editingEmployee}
				/>
			)}

			{/* CSV Upload Modal */}
			{isCSVModalOpen && (
				<CSVUpload
					onUpload={handleCSVUpload}
					onClose={() => setIsCSVModalOpen(false)}
				/>
			)}

			{/* Loading Overlay */}
			{isLoading && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-xl p-6 flex items-center gap-3">
						<svg className="w-6 h-6 animate-spin text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
						</svg>
						<span className="text-gray-700">Procesando...</span>
					</div>
				</div>
			)}
		</>
	);
}
