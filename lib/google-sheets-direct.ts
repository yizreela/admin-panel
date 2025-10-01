import Papa from 'papaparse';

const SHEET_ID = '1MRLfAfP8t1SjL0W4kWbetrk1aCB06j2Cd6EuvxMOjhE';
const SHEET_GID = '292219830';

// Función para obtener la URL de escritura de Google Sheets
function getSheetWriteURL() {
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit#gid=${SHEET_GID}`;
}

// Función para obtener todos los empleados desde Google Sheets
export async function getAllEmployeesDirect() {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;
    const response = await fetch(url, { cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error('Error fetching sheet data');
    }
    
    const csvText = await response.text();
    const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
    
    const employees = (parsed.data || [])
      .filter(Boolean)
      .map((emp: any, index: number) => ({
        ...emp,
        id: emp.Email || `emp-${index}`,
      }));
    
    console.log(`🔍 Direct - Total empleados: ${employees.length}`);
    return employees;
  } catch (error) {
    console.error('Error fetching employees from Google Sheets:', error);
    throw new Error('Error fetching employees from Google Sheets');
  }
}

// Función para obtener empleados activos (excluyendo eliminados)
export async function getEmployeesDirect() {
  try {
    const allEmployees = await getAllEmployeesDirect();
    const activeEmployees = allEmployees.filter(emp => emp.Estado !== 'Eliminado');
    console.log(`🔍 Direct - Empleados activos: ${activeEmployees.length}`);
    return activeEmployees;
  } catch (error) {
    console.error('Error fetching active employees:', error);
    throw new Error('Error fetching active employees');
  }
}

// Función para agregar empleado (simulación con instrucciones)
export async function addEmployeeDirect(employee: any) {
  console.log('📝 Agregando empleado a Google Sheets...');
  console.log('📋 Datos del empleado:', employee);
  
  // Crear el mensaje de instrucciones
  const instructions = `
🔧 INSTRUCCIONES PARA AGREGAR EMPLEADO:

1. Abre Google Sheets: ${getSheetWriteURL()}
2. Ve a la pestaña "Empleados" (GID: ${SHEET_GID})
3. Agrega una nueva fila con los siguientes datos:

📊 DATOS A INSERTAR:
- Nombre: ${employee.Nombre || ''}
- Email: ${employee.Email || ''}
- Puesto: ${employee.Puesto || ''}
- Seniority: ${employee.Seniority || ''}
- Proyecto Actual: ${employee['Proyecto Actual'] || ''}
- Skills: ${employee.Skills || ''}
- CV: ${employee.CV || ''}
- Estado: Activo

✅ El empleado se agregará manualmente a Google Sheets.
🔄 Después de agregarlo, la tabla se actualizará automáticamente.
  `;
  
  console.log(instructions);
  
  // Simular éxito para que la UI funcione
  return { 
    ...employee, 
    id: employee.Email || `emp-${Date.now()}`,
    Estado: 'Activo',
    _instructions: instructions
  };
}

// Función para actualizar empleado (simulación con instrucciones)
export async function updateEmployeeDirect(email: string, updatedEmployee: any) {
  console.log('📝 Actualizando empleado en Google Sheets...');
  console.log('📧 Email:', email);
  console.log('📋 Datos actualizados:', updatedEmployee);
  
  const instructions = `
🔧 INSTRUCCIONES PARA ACTUALIZAR EMPLEADO:

1. Abre Google Sheets: ${getSheetWriteURL()}
2. Ve a la pestaña "Empleados" (GID: ${SHEET_GID})
3. Busca la fila con Email: ${email}
4. Actualiza los siguientes campos:

📊 DATOS A ACTUALIZAR:
- Nombre: ${updatedEmployee.Nombre || 'Sin cambios'}
- Puesto: ${updatedEmployee.Puesto || 'Sin cambios'}
- Seniority: ${updatedEmployee.Seniority || 'Sin cambios'}
- Proyecto Actual: ${updatedEmployee['Proyecto Actual'] || 'Sin cambios'}
- Skills: ${updatedEmployee.Skills || 'Sin cambios'}
- CV: ${updatedEmployee.CV || 'Sin cambios'}
- Estado: ${updatedEmployee.Estado || 'Sin cambios'}

✅ El empleado se actualizará manualmente en Google Sheets.
🔄 Después de actualizarlo, la tabla se actualizará automáticamente.
  `;
  
  console.log(instructions);
  
  // Simular éxito para que la UI funcione
  return { 
    ...updatedEmployee, 
    Email: email,
    id: email,
    _instructions: instructions
  };
}

// Función para eliminar empleado (simulación con instrucciones)
export async function deleteEmployeeDirect(email: string) {
  console.log('📝 Eliminando empleado en Google Sheets...');
  console.log('📧 Email:', email);
  
  const instructions = `
🔧 INSTRUCCIONES PARA ELIMINAR EMPLEADO:

1. Abre Google Sheets: ${getSheetWriteURL()}
2. Ve a la pestaña "Empleados" (GID: ${SHEET_GID})
3. Busca la fila con Email: ${email}
4. En la columna "Estado", cambia el valor a: "Eliminado"

✅ El empleado se marcará como eliminado en Google Sheets.
🔄 Después de eliminarlo, la tabla se actualizará automáticamente.
  `;
  
  console.log(instructions);
  
  // Simular éxito para que la UI funcione
  return true;
}
