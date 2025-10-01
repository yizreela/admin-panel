"use client";

import React, { useState } from "react";
import Papa from "papaparse";

type Props = {
	onUpload: (data: any[]) => void;
	onClose: () => void;
};

type OperationResult = {
	success: number;
	errors: number;
	inserted: number;
	updated: number;
	deleted: number;
	details: string[];
};

type OperationType = 'insert' | 'update' | 'delete';

export default function CSVUpload({ onUpload, onClose }: Props) {
	const [file, setFile] = useState<File | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const [error, setError] = useState("");
	const [result, setResult] = useState<OperationResult | null>(null);
	const [preview, setPreview] = useState<any[]>([]);
	const [selectedOperation, setSelectedOperation] = useState<OperationType>('insert');

	// Debug: Log selectedOperation changes
	console.log(`🔍 CSVUpload - selectedOperation actual:`, selectedOperation);
	
	// Debug: Log when selectedOperation changes
	React.useEffect(() => {
		console.log(`🔄 selectedOperation cambió a:`, selectedOperation);
	}, [selectedOperation]);

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = e.target.files?.[0];
		if (selectedFile) {
			if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
				setError("Por favor selecciona un archivo CSV válido");
				return;
			}
			setFile(selectedFile);
			setError("");
			setResult(null);
			setPreview([]);
			
			// Preview the file
			Papa.parse(selectedFile, {
				header: true,
				skipEmptyLines: true,
				complete: (results) => {
					setPreview(results.data.slice(0, 5)); // Show first 5 rows
				}
			});
		}
	};

	const processBulkOperations = async (data: any[]): Promise<OperationResult> => {
		console.log(`🚀 Iniciando procesamiento masivo con operación: ${selectedOperation}`);
		console.log(`📊 Datos a procesar:`, data);
		console.log(`🔍 selectedOperation type:`, typeof selectedOperation);
		console.log(`🔍 selectedOperation value:`, selectedOperation);
		
		// Find email column for delete operations
		let emailColumn = 'Email';
		if (selectedOperation === 'delete' && data.length > 0) {
			const headers = Object.keys(data[0]);
			emailColumn = headers.find(header => 
				header.toLowerCase().includes('email') || 
				header.toLowerCase().includes('correo') ||
				header.toLowerCase().includes('mail')
			) || 'Email';
			console.log(`🔍 Columna Email detectada: "${emailColumn}"`);
		}
		
		const result: OperationResult = {
			success: 0,
			errors: 0,
			inserted: 0,
			updated: 0,
			deleted: 0,
			details: []
		};

		console.log(`🔍 Total empleados a procesar: ${data.length}`);
		console.log(`🔍 Empleados en el CSV:`, data.map(emp => ({ nombre: emp.Nombre, email: emp.Email })));
		
		// Check for duplicates in the data
		const emails = data.map(emp => emp[emailColumn]);
		const uniqueEmails = [...new Set(emails)];
		console.log(`🔍 Emails únicos: ${uniqueEmails.length}, Total emails: ${emails.length}`);
		if (uniqueEmails.length !== emails.length) {
			console.error(`🚨 DUPLICADOS DETECTADOS: ${emails.length - uniqueEmails.length} emails duplicados`);
		}

		// Get existing employees once to avoid duplicate API calls
		let existingEmployees: any[] = [];
		try {
			// Para operaciones de delete e insert, necesitamos cargar TODOS los empleados (incluyendo eliminados)
			// Para operaciones de update, cargamos solo los activos
			const endpoint = (selectedOperation === 'delete' || selectedOperation === 'insert') ? '/api/employees/all' : '/api/employees';
			const existingResponse = await fetch(endpoint);
			if (existingResponse.ok) {
				existingEmployees = await existingResponse.json();
				console.log(`📋 Empleados existentes cargados: ${existingEmployees.length} (endpoint: ${endpoint})`);
			}
		} catch (error) {
			console.log(`⚠️ No se pudieron cargar empleados existentes:`, error);
		}
		
		for (const employee of data) {
			try {
				const operation = selectedOperation;
				
				console.log(`🔄 Procesando empleado: ${employee.Nombre} (${employee.Email})`);
				console.log(`🔧 OPERACIÓN SELECCIONADA: ${operation}`);
				console.log(`🔧 selectedOperation en bucle:`, selectedOperation);
				
				// Validate required fields for delete operation (actually UPDATE Estado)
				if (operation === 'delete') {
					const employeeEmail = employee[emailColumn];
					console.log(`🔄 Ejecutando operación UPDATE para marcar como eliminado: ${employeeEmail}`);
					
					if (!employeeEmail) {
						result.errors++;
						result.details.push(`❌ Error: Email requerido para eliminar empleado ${employee.Nombre || 'sin nombre'}`);
						continue;
					}
					
					// Update operation to set Estado = 'Eliminado'
					const response = await fetch('/api/employees', {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							Email: employeeEmail,
							Estado: 'Eliminado'
						})
					});
					
					if (response.ok) {
						result.deleted++;
						result.success++;
						result.details.push(`✅ Marcado como eliminado: ${employee.Nombre || 'Sin nombre'} (${employeeEmail})`);
					} else {
						let errorMessage = `Error del servidor: ${response.status}`;
						
						try {
							const errorData = await response.json();
							errorMessage = errorData.error || errorData.message || errorMessage;
						} catch (parseError) {
							errorMessage = `Error del servidor: ${response.status} - No se pudo parsear la respuesta`;
						}
						
						result.errors++;
						result.details.push(`❌ Error marcando como eliminado: ${employee.Nombre || 'Sin nombre'} - ${errorMessage}`);
					}
					continue; // IMPORTANTE: Salir después de procesar delete
				} else if (operation === 'update') {
					console.log(`✏️ Ejecutando operación UPDATE para ${employee.Email}`);
					
					// Update operation - can modify all fields except Email
					const response = await fetch('/api/employees', {
						method: 'PUT',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							...employee,
							// Ensure Email is not changed
							Email: employee.Email
						})
					});

					if (response.ok) {
						result.updated++;
						result.success++;
						result.details.push(`✅ Actualizado: ${employee.Nombre} (${employee.Email})`);
					} else {
						result.errors++;
						const errorData = await response.json().catch(() => ({}));
						result.details.push(`❌ Error actualizando: ${employee.Nombre} - ${errorData.error || 'Error desconocido'}`);
					}
					continue; // IMPORTANTE: Salir después de procesar update
				} else if (operation === 'insert') {
					console.log(`➕ Verificando INSERT para ${employee.Email}`);
					
					// Check if email already exists and its status
					const existingEmployee = existingEmployees.find((emp: any) => emp.Email === employee.Email);
					
					console.log(`🔍 Verificando email: ${employee.Email}`);
					console.log(`🔍 Empleado existente:`, existingEmployee);
					
					if (existingEmployee) {
						// Email exists, check if it's deleted
						if (existingEmployee.Estado === 'Eliminado') {
							console.log(`🔄 Email existe pero está eliminado, reactivando: ${employee.Email}`);
							
							// Update the employee to set status to 'Activo'
							const response = await fetch('/api/employees', {
								method: 'PUT',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify({
									Email: employee.Email,
									...employee,
									Estado: 'Activo'
								})
							});

							if (response.ok) {
								result.updated++;
								result.success++;
								result.details.push(`🔄 Reactivado: ${employee.Nombre} (${employee.Email}) - Cambiado de Eliminado a Activo`);
							} else {
								result.errors++;
								const errorData = await response.json().catch(() => ({}));
								result.details.push(`❌ Error reactivando: ${employee.Nombre} - ${errorData.error || 'Error desconocido'}`);
							}
						} else {
							console.log(`ℹ️ Email ya existe y está activo, saltando: ${employee.Email}`);
							result.success++; // Count as success since it's expected behavior
							result.details.push(`ℹ️ Ya existe: ${employee.Nombre} (${employee.Email}) - No se agregó porque el email ya está registrado y activo`);
						}
					} else {
						console.log(`➕ Email no existe, creando nuevo empleado: ${employee.Email}`);
						
						// Insert new employee
						const response = await fetch('/api/employees', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json',
							},
							body: JSON.stringify({
								...employee,
								Estado: 'Activo'
							})
						});

						if (response.ok) {
							result.inserted++;
							result.success++;
							result.details.push(`✅ Agregado: ${employee.Nombre} (${employee.Email})`);
						} else {
							result.errors++;
							const errorData = await response.json().catch(() => ({}));
							result.details.push(`❌ Error agregando: ${employee.Nombre} - ${errorData.error || 'Error desconocido'}`);
						}
					}
					continue; // IMPORTANTE: Salir después de procesar insert
				} else {
					console.log(`❓ Operación desconocida: ${operation} para ${employee.Email}`);
					result.errors++;
					result.details.push(`❌ Operación desconocida: ${operation} para ${employee.Nombre}`);
				}
			} catch (error) {
				result.errors++;
				result.details.push(`❌ Error procesando: ${employee.Nombre} - ${error instanceof Error ? error.message : 'Error desconocido'}`);
			}
		}

		return result;
	};

	const handleUpload = async () => {
		if (!file) {
			setError("Por favor selecciona un archivo");
			return;
		}

		setIsUploading(true);
		setError("");

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: async (results) => {
				// Validate required columns based on operation
				const headers = results.meta.fields || [];
				let requiredColumns;
				let missingColumns;
				
				console.log(`🔍 Validando columnas para operación: ${selectedOperation}`);
				console.log(`📋 Headers encontrados:`, headers);
				
				if (selectedOperation === 'delete') {
					// For delete operation, only Email is required (case-insensitive search)
					const emailColumn = headers.find(header => 
						header.toLowerCase().includes('email') || 
						header.toLowerCase().includes('correo') ||
						header.toLowerCase().includes('mail')
					);
					
					if (!emailColumn) {
						setError(`No se encontró una columna de Email en el CSV. Buscamos columnas que contengan: email, correo, mail`);
						setIsUploading(false);
						return;
					}
					
					console.log(`✅ Operación DELETE: Columna Email encontrada: "${emailColumn}"`);
				} else {
					// For other operations, require all fields
					requiredColumns = ["Nombre", "Email", "Puesto", "Seniority", "Proyecto Actual", "Skills"];
					missingColumns = requiredColumns.filter(col => !headers.includes(col));
					console.log(`✅ Operación ${selectedOperation}: Requiere todas las columnas`);
					
					if (missingColumns.length > 0) {
						setError(`Faltan las siguientes columnas: ${missingColumns.join(", ")}`);
						setIsUploading(false);
						return;
					}
				}

				// Validate data based on selected operation
				let validData;
				if (selectedOperation === 'delete') {
					// For delete operation, find the email column and validate
					const emailColumn = headers.find(header => 
						header.toLowerCase().includes('email') || 
						header.toLowerCase().includes('correo') ||
						header.toLowerCase().includes('mail')
					);
					
					if (!emailColumn) {
						setError(`No se encontró una columna de Email en el CSV. Buscamos columnas que contengan: email, correo, mail`);
						setIsUploading(false);
						return;
					}
					
					validData = results.data.filter((row: any) => {
						return row[emailColumn] && row[emailColumn].trim() !== '';
					});
					console.log(`✅ Operación DELETE: ${validData.length} emails válidos encontrados en columna "${emailColumn}"`);
				} else {
					// For insert/update operations, require all fields
					validData = results.data.filter((row: any) => {
						return row.Nombre && row.Email && row.Puesto && row.Seniority;
					});
					console.log(`✅ Operación ${selectedOperation}: ${validData.length} empleados válidos encontrados`);
				}

				if (validData.length === 0) {
					if (selectedOperation === 'delete') {
						setError("No se encontraron emails válidos en el archivo para eliminar");
					} else {
						setError("No se encontraron datos válidos en el archivo");
					}
					setIsUploading(false);
					return;
				}

				// Process bulk operations
				const operationResult = await processBulkOperations(validData);
				setResult(operationResult);
				setIsUploading(false);
				
				// Always refresh the parent component after processing
				console.log(`🔄 Refrescando componente padre después de procesar ${validData.length} empleados`);
				onUpload([]); // Pass empty array to just trigger refresh
			},
			error: (error) => {
				setIsUploading(false);
				setError(`Error al procesar el archivo: ${error.message}`);
			}
		});
	};

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
				<div className="p-6">
					<div className="flex items-center justify-between mb-6">
						<h2 className="text-xl font-semibold text-gray-900">Operaciones Masivas CSV</h2>
						<button
							onClick={onClose}
							className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
						>
							<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div className="space-y-6">
						{/* File Upload Section */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-2">
								Seleccionar archivo CSV
							</label>
							<div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
								<input
									type="file"
									accept=".csv"
									onChange={handleFileChange}
									className="hidden"
									id="csv-upload"
								/>
								<label htmlFor="csv-upload" className="cursor-pointer">
									<svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
									</svg>
									<p className="mt-2 text-sm text-gray-600">
										{file ? file.name : "Haz clic para seleccionar un archivo CSV"}
									</p>
									<p className="text-xs text-gray-500 mt-1">
										Para eliminar: Solo columna Email. Para otras operaciones: Nombre, Email, Puesto, Seniority, Proyecto Actual, Skills
									</p>
								</label>
							</div>
						</div>

						{/* Preview Section */}
						{preview.length > 0 && (
							<div>
								<h3 className="text-sm font-medium text-gray-700 mb-3">Vista previa (primeras 5 filas)</h3>
								<div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
									<table className="min-w-full text-xs">
										<thead>
											<tr className="border-b border-gray-200">
												{Object.keys(preview[0] || {}).map(key => (
													<th key={key} className="text-left py-2 px-2 font-medium text-gray-600">
														{key}
													</th>
												))}
											</tr>
										</thead>
										<tbody>
											{preview.map((row, index) => (
												<tr key={index} className="border-b border-gray-100">
													{Object.values(row).map((value, i) => (
														<td key={i} className="py-2 px-2 text-gray-800">
															{String(value || '')}
														</td>
													))}
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						)}

						{/* Operation Selection */}
						<div>
							<h3 className="text-sm font-medium text-gray-700 mb-3">Seleccionar operación:</h3>
							<div className="grid grid-cols-3 gap-3">

								<button
									onClick={() => setSelectedOperation('insert')}
									className={`p-3 rounded-lg border-2 transition-colors ${
										selectedOperation === 'insert'
											? 'border-green-500 bg-green-50 text-green-700'
											: 'border-gray-200 hover:border-gray-300 text-gray-600'
									}`}
								>
									<div className="text-center">
										<svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
										</svg>
										<div className="text-xs font-medium">Agregar</div>
										<div className="text-xs text-gray-500">Solo nuevos</div>
									</div>
								</button>

								<button
									onClick={() => setSelectedOperation('update')}
									className={`p-3 rounded-lg border-2 transition-colors ${
										selectedOperation === 'update'
											? 'border-yellow-500 bg-yellow-50 text-yellow-700'
											: 'border-gray-200 hover:border-gray-300 text-gray-600'
									}`}
								>
									<div className="text-center">
										<svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
										</svg>
										<div className="text-xs font-medium">Actualizar</div>
										<div className="text-xs text-gray-500">Por Email</div>
									</div>
								</button>

								<button
									onClick={() => {
										console.log(`🔴 Usuario hizo clic en ELIMINAR`);
										setSelectedOperation('delete');
										console.log(`🔴 selectedOperation establecido a: delete`);
									}}
									className={`p-3 rounded-lg border-2 transition-colors ${
										selectedOperation === 'delete'
											? 'border-red-500 bg-red-50 text-red-700'
											: 'border-gray-200 hover:border-gray-300 text-gray-600'
									}`}
								>
									<div className="text-center">
										<svg className="w-6 h-6 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
										</svg>
										<div className="text-xs font-medium">Eliminar</div>
										<div className="text-xs text-gray-500">Por Email</div>
									</div>
								</button>
							</div>
						</div>

						{/* Instructions based on selected operation */}
						<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
							<h4 className="text-sm font-medium text-blue-800 mb-2">
								Instrucciones para {selectedOperation === 'insert' ? 'agregar empleados' : selectedOperation === 'update' ? 'actualizar empleados' : 'eliminar empleados'}:
							</h4>
							{selectedOperation === 'insert' && (
								<ul className="text-xs text-blue-700 space-y-1">
									<li>• <strong>Requerido:</strong> Nombre, Email, Puesto, Seniority, Proyecto Actual, Skills</li>
									<li>• <strong>Opcional:</strong> CV, Estado (por defecto será "Activo")</li>
									<li>• <strong>Nota:</strong> Todos los empleados se agregarán como nuevos</li>
								</ul>
							)}
							{selectedOperation === 'update' && (
								<ul className="text-xs text-blue-700 space-y-1">
									<li>• <strong>Requerido:</strong> Email (debe existir), campos a actualizar</li>
									<li>• <strong>Modificable:</strong> Nombre, Puesto, Seniority, Proyecto Actual, Skills, CV, Estado</li>
									<li>• <strong>No modificable:</strong> Email (identificador único)</li>
									<li>• <strong>Nota:</strong> Solo se actualizarán empleados existentes</li>
								</ul>
							)}
							{selectedOperation === 'delete' && (
								<ul className="text-xs text-blue-700 space-y-1">
									<li>• <strong>Requerido:</strong> Columna que contenga "Email", "Correo" o "Mail"</li>
									<li>• <strong>Formato CSV:</strong> Cualquier CSV con columna de email (puede tener otras columnas)</li>
									<li>• <strong>Operación:</strong> UPDATE Estado = "Eliminado" (soft delete)</li>
									<li>• <strong>Ejemplo:</strong> CSV con columnas: Nombre, Email, Departamento</li>
								</ul>
							)}
						</div>

						{/* Error Display */}
						{error && (
							<div className="bg-red-50 border border-red-200 rounded-lg p-3">
								<div className="flex items-center gap-2">
									<svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
									</svg>
									<span className="text-sm text-red-700">{error}</span>
								</div>
							</div>
						)}

						{/* Results Display */}
						{result && (
							<div className="bg-green-50 border border-green-200 rounded-lg p-4">
								<h4 className="text-sm font-medium text-green-800 mb-3">Resultado de la operación:</h4>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
									<div className="text-center">
										<div className="text-lg font-bold text-green-600">{result.success}</div>
										<div className="text-xs text-green-700">Exitosos</div>
									</div>
									<div className="text-center">
										<div className="text-lg font-bold text-blue-600">{result.inserted}</div>
										<div className="text-xs text-blue-700">Nuevos Agregados</div>
									</div>
									<div className="text-center">
										<div className="text-lg font-bold text-yellow-600">{result.updated}</div>
										<div className="text-xs text-yellow-700">Actualizados</div>
									</div>
									<div className="text-center">
										<div className="text-lg font-bold text-red-600">{result.deleted}</div>
										<div className="text-xs text-red-700">Eliminados</div>
									</div>
								</div>
								{result.errors > 0 && (
									<div className="text-center mb-3">
										<div className="text-lg font-bold text-red-600">{result.errors}</div>
										<div className="text-xs text-red-700">Errores</div>
									</div>
								)}
								
								{/* Mostrar mensaje informativo cuando todos los empleados ya existen */}
								{result.success > 0 && result.inserted === 0 && result.updated === 0 && result.deleted === 0 && (
									<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
										<div className="flex items-center gap-2">
											<svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
											</svg>
											<div>
												<div className="text-sm font-medium text-blue-800">
													{result.success} empleados ya existían
												</div>
												<div className="text-xs text-blue-600">
													No se agregaron porque los emails ya están registrados
												</div>
											</div>
										</div>
									</div>
								)}
								<div className="max-h-32 overflow-y-auto">
									{result.details.map((detail, index) => (
										<div key={index} className="text-xs text-gray-700 py-1">
											{detail}
										</div>
									))}
								</div>
							</div>
						)}

						{/* Action Buttons */}
						<div className="flex gap-3">
							<button
								onClick={handleUpload}
								disabled={!file || isUploading}
								className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
							>
								{isUploading ? "Procesando..." : "Procesar CSV"}
							</button>
							<button
								onClick={onClose}
								className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
							>
								{result ? "Cerrar" : "Cancelar"}
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}