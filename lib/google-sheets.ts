import { google } from 'googleapis';
import { 
  getEmployeesFallback, 
  addEmployeeFallback, 
  updateEmployeeFallback, 
  deleteEmployeeFallback 
} from './fallback-sheets';
import {
  getAllEmployeesDirect,
  getEmployeesDirect,
  addEmployeeDirect,
  updateEmployeeDirect,
  deleteEmployeeDirect
} from './google-sheets-direct';

const SPREADSHEET_ID = '1MRLfAfP8t1SjL0W4kWbetrk1aCB06j2Cd6EuvxMOjhE';
const SHEET_RANGE = 'A:H'; // A:H covers all columns including Estado

// Initialize Google Sheets API
function getSheetsAPI() {
  // Check if credentials are configured
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || 
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL === 'your-service-account@your-project.iam.gserviceaccount.com' ||
      process.env.GOOGLE_PRIVATE_KEY === '-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----\\n') {
    console.log('⚠️ Google Sheets API credentials not configured or using default values');
    console.log('📋 GOOGLE_SERVICE_ACCOUNT_EMAIL:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ? '✅ Set' : '❌ Missing');
    console.log('📋 GOOGLE_PRIVATE_KEY:', process.env.GOOGLE_PRIVATE_KEY ? '✅ Set' : '❌ Missing');
    throw new Error('Google Sheets API not configured. Please set up authentication to add employees.');
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  return google.sheets({ version: 'v4', auth });
}

// Get all employees from Google Sheet (including deleted ones)
export async function getAllEmployees() {
  try {
    // Try Google Sheets API first
    const sheets = getSheetsAPI();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    // Convert to objects (skip header row)
    const headers = rows[0];
    const employees = rows.slice(1).map((row, index) => {
      const employee: any = {};
      headers.forEach((header, i) => {
        employee[header] = row[i] || '';
      });
      employee.id = employee.Email || `emp-${index}`;
      return employee;
    });

    console.log(`🔍 Total empleados (incluyendo eliminados): ${employees.length}`);
    return employees;
  } catch (error) {
    console.error('Google Sheets API error, using direct method:', error);
    // Use direct method instead of fallback
    return await getAllEmployeesDirect();
  }
}

// Get all employees from Google Sheet (excluding deleted ones)
export async function getEmployees() {
  try {
    // Try Google Sheets API first
    const sheets = getSheetsAPI();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return [];

    // Convert to objects (skip header row)
    const headers = rows[0];
    const employees = rows.slice(1).map((row, index) => {
      const employee: any = {};
      headers.forEach((header, i) => {
        employee[header] = row[i] || '';
      });
      employee.id = employee.Email || `emp-${index}`;
      return employee;
    });

    // Filter out deleted employees (Estado !== 'Eliminado')
    console.log(`🔍 Total empleados antes del filtro: ${employees.length}`);
    console.log(`🔍 Empleados con Estado:`, employees.map(emp => ({ nombre: emp.Nombre, estado: emp.Estado })));
    
    const filteredEmployees = employees.filter(emp => {
      const isNotDeleted = emp.Estado !== 'Eliminado';
      console.log(`🔍 Filtro: ${emp.Nombre} - Estado: "${emp.Estado}" - No eliminado: ${isNotDeleted}`);
      return isNotDeleted;
    });
    console.log(`🔍 Total empleados después del filtro: ${filteredEmployees.length}`);
    console.log(`🔍 Empleados filtrados:`, filteredEmployees.map(emp => ({ nombre: emp.Nombre, estado: emp.Estado })));
    
    return filteredEmployees;
  } catch (error) {
    console.error('Google Sheets API error, using direct method:', error);
    // Use direct method instead of fallback
    return await getEmployeesDirect();
  }
}

// Add new employee to Google Sheet
export async function addEmployee(employee: any) {
  try {
    const sheets = getSheetsAPI();
    
    // Check if email already exists
    const existingEmployees = await getEmployees();
    const emailExists = existingEmployees.some((emp: any) => emp.Email === employee.Email);
    if (emailExists) {
      throw new Error('El email ya existe');
    }

    // Prepare row data
    const rowData = [
      employee.Nombre || '',
      employee.Email || '',
      employee.Puesto || '',
      employee.Seniority || '',
      employee['Proyecto Actual'] || '',
      employee.Skills || '',
      employee.CV || '',
      'Activo' // Estado por defecto
    ];

    // Append row to sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGE,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    });

    return { ...employee, id: employee.Email };
  } catch (error) {
    console.error('Google Sheets API error, using direct method:', error);
    // Use direct method instead of fallback
    return await addEmployeeDirect(employee);
  }
}

// Update employee in Google Sheet
export async function updateEmployee(email: string, updatedEmployee: any) {
  try {
    console.log(`🔄 Actualizando empleado: ${email}`, updatedEmployee);
    const sheets = getSheetsAPI();
    
    // Get all employees (including deleted ones) to find the row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) {
      throw new Error('No se encontraron empleados');
    }

    // Find the employee row (including deleted ones)
    const headers = rows[0];
    let employeeIndex = -1;
    let employeeRow = null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const employee: any = {};
      headers.forEach((header, j) => {
        employee[header] = row[j] || '';
      });
      
      // Compare emails case-insensitive and trim whitespace
      const employeeEmail = (employee.Email || '').toString().trim().toLowerCase();
      const searchEmail = email.trim().toLowerCase();
      
      if (employeeEmail === searchEmail) {
        employeeIndex = i;
        employeeRow = employee;
        console.log(`✅ Empleado encontrado en fila ${i + 1}:`, employee);
        break;
      }
    }

    if (employeeIndex === -1) {
      throw new Error(`Empleado con email ${email} no encontrado`);
    }

    // Row number (add 1 because array is 0-based but sheets are 1-based)
    const rowNumber = employeeIndex + 1;

    // Prepare updated row data - merge with existing data
    const rowData = [
      updatedEmployee.Nombre !== undefined ? updatedEmployee.Nombre : employeeRow.Nombre || '',
      employeeRow.Email || '', // Email nunca se cambia, siempre usa el existente
      updatedEmployee.Puesto !== undefined ? updatedEmployee.Puesto : employeeRow.Puesto || '',
      updatedEmployee.Seniority !== undefined ? updatedEmployee.Seniority : employeeRow.Seniority || '',
      updatedEmployee['Proyecto Actual'] !== undefined ? updatedEmployee['Proyecto Actual'] : employeeRow['Proyecto Actual'] || '',
      updatedEmployee.Skills !== undefined ? updatedEmployee.Skills : employeeRow.Skills || '',
      updatedEmployee.CV !== undefined ? updatedEmployee.CV : employeeRow.CV || '',
      updatedEmployee.Estado !== undefined ? updatedEmployee.Estado : employeeRow.Estado || 'Activo'
    ];

    console.log(`📝 Actualizando fila ${rowNumber} con datos:`, rowData);

    // Update the specific row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `A${rowNumber}:H${rowNumber}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [rowData]
      }
    });

    console.log(`✅ Empleado ${email} actualizado exitosamente`);
    return { ...updatedEmployee, id: email };
  } catch (error) {
    console.error('Google Sheets API error, using direct method:', error);
    // Use direct method instead of fallback
    return await updateEmployeeDirect(email, updatedEmployee);
  }
}

// Soft delete employee (mark as deleted)
export async function deleteEmployee(email: string) {
  try {
    console.log(`🗑️ Intentando eliminar empleado: ${email}`);
    const sheets = getSheetsAPI();
    
    // Get all employees (including deleted ones) to find the row number
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: SHEET_RANGE,
    });

    const rows = response.data.values || [];
    console.log(`📊 Total de filas encontradas: ${rows.length}`);
    
    if (rows.length === 0) {
      throw new Error('No se encontraron empleados');
    }

    // Find the employee row (including deleted ones)
    const headers = rows[0];
    let employeeIndex = -1;
    let employeeRow = null;

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const employee: any = {};
      headers.forEach((header, j) => {
        employee[header] = row[j] || '';
      });
      
      // Compare emails case-insensitive and trim whitespace
      const employeeEmail = (employee.Email || '').toString().trim().toLowerCase();
      const searchEmail = email.trim().toLowerCase();
      
      console.log(`🔍 Comparando: "${employeeEmail}" === "${searchEmail}"`);
      
      if (employeeEmail === searchEmail) {
        employeeIndex = i;
        employeeRow = employee;
        console.log(`✅ Empleado encontrado en fila ${i + 1}:`, employee);
        break;
      }
    }

    if (employeeIndex === -1) {
      console.log(`❌ Empleado con email ${email} no encontrado`);
      console.log(`📋 Emails disponibles en la hoja:`, rows.slice(1).map((row, i) => {
        const emp: any = {};
        headers.forEach((header, j) => {
          emp[header] = row[j] || '';
        });
        return `${i + 1}: ${emp.Email} (${emp.Nombre})`;
      }));
      throw new Error(`Empleado con email ${email} no encontrado`);
    }

    if (employeeRow.Estado === 'Eliminado') {
      throw new Error('El empleado ya está eliminado');
    }

    // Row number (add 1 because array is 0-based but sheets are 1-based)
    const rowNumber = employeeIndex + 1;
    console.log(`📝 Actualizando fila ${rowNumber} con Estado = 'Eliminado'`);

    // Update the Estado column to 'Eliminado'
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `H${rowNumber}`, // Solo la columna Estado
      valueInputOption: 'RAW',
      requestBody: {
        values: [['Eliminado']]
      }
    });

    console.log(`✅ Empleado ${email} marcado como eliminado exitosamente`);
    return true;
  } catch (error) {
    console.error('❌ Google Sheets API error, using direct method:', error);
    // Use direct method instead of fallback
    return await deleteEmployeeDirect(email);
  }
}
