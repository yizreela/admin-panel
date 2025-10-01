import { NextRequest, NextResponse } from 'next/server';
import { addEmployee } from '../../../../lib/google-sheets';

// POST /api/employees/add - Agregar empleado
export async function POST(request: NextRequest) {
  try {
    const newEmployee = await request.json();

    const requiredFields = ['Nombre', 'Email', 'Puesto', 'Seniority', 'Proyecto Actual', 'Skills'];
    for (const field of requiredFields) {
      if (!newEmployee[field]) {
        return NextResponse.json({ error: `Campo requerido: ${field}` }, { status: 400 });
      }
    }

    const result = await addEmployee({ ...newEmployee, Estado: 'Activo' });
    return NextResponse.json({ success: true, employee: result });
  } catch (error) {
    console.error('Error adding employee:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error adding employee' }, { status: 500 });
  }
}


