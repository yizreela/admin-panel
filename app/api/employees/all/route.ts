import { NextResponse } from 'next/server';
import { getAllEmployees } from '../../../../lib/google-sheets';

// GET - Obtener todos los empleados (incluyendo eliminados)
export async function GET() {
  try {
    const employees = await getAllEmployees();
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching all employees:', error);
    return NextResponse.json({ error: 'Error fetching all employees' }, { status: 500 });
  }
}
