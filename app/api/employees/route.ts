import { NextRequest, NextResponse } from 'next/server';
import { getEmployees, getAllEmployees, addEmployee, updateEmployee, deleteEmployee } from '../../../lib/google-sheets';

// GET - Obtener empleados
export async function GET() {
  try {
    const employees = await getEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Error fetching employees' }, { status: 500 });
  }
}

// POST - Agregar empleado
export async function POST(request: NextRequest) {
  try {
    const newEmployee = await request.json();
    
    // Validar datos requeridos
    const requiredFields = ['Nombre', 'Email', 'Puesto', 'Seniority', 'Proyecto Actual', 'Skills'];
    for (const field of requiredFields) {
      if (!newEmployee[field]) {
        return NextResponse.json({ error: `Campo requerido: ${field}` }, { status: 400 });
      }
    }
    
    // Agregar empleado al Google Sheet
    const result = await addEmployee(newEmployee);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Empleado agregado correctamente',
      employee: result 
    });
    
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error adding employee' 
    }, { status: 500 });
  }
}

// PUT - Actualizar empleado
export async function PUT(request: NextRequest) {
  try {
    const requestData = await request.json();
    console.log('📥 PUT request data:', requestData);
    
    // Si viene con Email, usar Email como identificador
    if (requestData.Email) {
      const { Email, ...updatedEmployee } = requestData;
      console.log(`🔄 Actualizando empleado por Email: ${Email}`, updatedEmployee);
      
      // Actualizar empleado en Google Sheet
      const result = await updateEmployee(Email, updatedEmployee);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Empleado actualizado correctamente',
        employee: result 
      });
    } else {
      // Formato anterior con id
      const { id, ...updatedEmployee } = requestData;
      console.log(`🔄 Actualizando empleado por ID: ${id}`, updatedEmployee);
      
      // Actualizar empleado en Google Sheet
      const result = await updateEmployee(id, updatedEmployee);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Empleado actualizado correctamente',
        employee: result 
      });
    }
    
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error updating employee' 
    }, { status: 500 });
  }
}

// DELETE - Eliminar empleado
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log(`🗑️ API DELETE: Recibida solicitud para eliminar empleado con ID: ${id}`);
    
    if (!id) {
      console.log('❌ API DELETE: ID no proporcionado');
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    // Eliminar empleado del Google Sheet
    console.log(`🔄 API DELETE: Llamando a deleteEmployee(${id})`);
    await deleteEmployee(id);
    console.log(`✅ API DELETE: Empleado ${id} eliminado exitosamente`);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Empleado eliminado correctamente' 
    });
    
  } catch (error) {
    console.error('❌ API DELETE Error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error deleting employee' 
    }, { status: 500 });
  }
}
