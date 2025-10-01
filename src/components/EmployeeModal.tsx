"use client";

import { useState, useEffect } from "react";
import { Employee } from "./EmployeeTable";

type Props = {
	isOpen: boolean;
	onClose: () => void;
	onSave: (employee: Employee) => void;
	employee?: Employee | null;
};

export default function EmployeeModal({ isOpen, onClose, onSave, employee }: Props) {
	const [formData, setFormData] = useState<Employee>({
		Nombre: "",
		Email: "",
		Puesto: "",
		Seniority: "",
		"Proyecto Actual": "",
		Skills: "",
		CV: "",
	});

	useEffect(() => {
		if (employee) {
			setFormData(employee);
		} else {
			setFormData({
				Nombre: "",
				Email: "",
				Puesto: "",
				Seniority: "",
				"Proyecto Actual": "",
				Skills: "",
				CV: "",
			});
		}
	}, [employee]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave(formData);
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-900">
							{employee ? "Editar Empleado" : "Agregar Empleado"}
						</h2>
						<button
							onClick={onClose}
							className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Nombre *
								</label>
								<input
									type="text"
									required
									value={formData.Nombre}
									onChange={(e) => setFormData({ ...formData, Nombre: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Email *
								</label>
								<input
									type="email"
									required
									value={formData.Email}
									onChange={(e) => setFormData({ ...formData, Email: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Puesto *
								</label>
								<select
									required
									value={formData.Puesto}
									onChange={(e) => setFormData({ ...formData, Puesto: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="">Seleccionar puesto</option>
									<option value="Desarrollador">Desarrollador</option>
									<option value="QA">QA</option>
									<option value="Analista">Analista</option>
									<option value="DevOps">DevOps</option>
									<option value="Diseñador">Diseñador</option>
									<option value="Product Manager">Product Manager</option>
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Seniority *
								</label>
								<select
									required
									value={formData.Seniority}
									onChange={(e) => setFormData({ ...formData, Seniority: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								>
									<option value="">Seleccionar seniority</option>
									<option value="Junior">Junior</option>
									<option value="Mid">Mid</option>
									<option value="Senior">Senior</option>
									<option value="Lead">Lead</option>
									<option value="Sr">Sr</option>
								</select>
							</div>

							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Proyecto Actual *
								</label>
								<input
									type="text"
									required
									value={formData["Proyecto Actual"]}
									onChange={(e) => setFormData({ ...formData, "Proyecto Actual": e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>

							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									Skills *
								</label>
								<input
									type="text"
									required
									placeholder="Python, JavaScript, React, Node.js..."
									value={formData.Skills}
									onChange={(e) => setFormData({ ...formData, Skills: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
								<p className="text-xs text-gray-500 mt-1">Separar skills con comas</p>
							</div>

							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-700 mb-1">
									CV (URL)
								</label>
								<input
									type="url"
									placeholder="https://drive.google.com/file/d/..."
									value={formData.CV}
									onChange={(e) => setFormData({ ...formData, CV: e.target.value })}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
								/>
							</div>
						</div>

						<div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
							<button
								type="button"
								onClick={onClose}
								className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Cancelar
							</button>
							<button
								type="submit"
								className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
							>
								{employee ? "Actualizar" : "Agregar"}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
