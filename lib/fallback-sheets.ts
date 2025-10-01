import Papa from 'papaparse';

const SHEET_ID = '1MRLfAfP8t1SjL0W4kWbetrk1aCB06j2Cd6EuvxMOjhE';
const SHEET_GID = '292219830';

// Fallback method using CSV export (read-only) - including deleted employees
export async function getAllEmployeesFallback() {
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
    
    console.log(`🔍 Fallback - Total empleados (incluyendo eliminados): ${employees.length}`);
    return employees;
  } catch (error) {
    console.error('Error fetching employees from CSV:', error);
    throw new Error('Error fetching employees from Google Sheets');
  }
}

// Fallback method using CSV export (read-only) - excluding deleted employees
export async function getEmployeesFallback() {
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
    
    console.log(`🔍 Fallback - Total empleados antes del filtro: ${employees.length}`);
    console.log(`🔍 Fallback - Empleados con Estado:`, employees.map(emp => ({ nombre: emp.Nombre, estado: emp.Estado })));
    
    const filteredEmployees = employees.filter(emp => {
      const isNotDeleted = emp.Estado !== 'Eliminado';
      console.log(`🔍 Fallback - Filtro: ${emp.Nombre} - Estado: "${emp.Estado}" - No eliminado: ${isNotDeleted}`);
      return isNotDeleted;
    });
    console.log(`🔍 Fallback - Total empleados después del filtro: ${filteredEmployees.length}`);
    console.log(`🔍 Fallback - Empleados filtrados:`, filteredEmployees.map(emp => ({ nombre: emp.Nombre, estado: emp.Estado })));
    
    return filteredEmployees;
  } catch (error) {
    console.error('Error fetching employees from CSV:', error);
    throw new Error('Error fetching employees from Google Sheets');
  }
}

// Mock functions for write operations (since we can't write via CSV)
export async function addEmployeeFallback(employee: any) {
  console.log('⚠️ Google Sheets API not configured. Simulating add for:', employee);
  // Simular agregado exitoso para testing
  console.log(`✅ [SIMULADO] Empleado agregado:`, employee);
  return { ...employee, id: employee.Email || `emp-${Date.now()}` };
}

export async function updateEmployeeFallback(email: string, updatedEmployee: any) {
  console.log('⚠️ Google Sheets API not configured. Simulating update for:', { email, updatedEmployee });
  // Simular actualización exitosa para testing
  console.log(`✅ [SIMULADO] Empleado ${email} actualizado:`, updatedEmployee);
  return { ...updatedEmployee, id: email };
}

export async function deleteEmployeeFallback(email: string) {
  console.log('⚠️ Google Sheets API not configured. Simulating delete for:', email);
  // Simular eliminación exitosa para testing
  console.log(`✅ [SIMULADO] Empleado ${email} marcado como eliminado`);
  return true;
}
