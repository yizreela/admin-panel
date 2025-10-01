import { NextRequest, NextResponse } from 'next/server';
import { updateEmployee } from '../../../../lib/google-sheets';

// PUT /api/employees/update - Actualizar empleado por Email o id
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    if (data.Email) {
      const { Email, ...updated } = data;
      const result = await updateEmployee(Email, updated);
      return NextResponse.json({ success: true, employee: result });
    }

    if (data.id) {
      const { id, ...updated } = data;
      const result = await updateEmployee(id, updated);
      return NextResponse.json({ success: true, employee: result });
    }

    return NextResponse.json({ error: 'Se requiere Email o id' }, { status: 400 });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error updating employee' }, { status: 500 });
  }
}


