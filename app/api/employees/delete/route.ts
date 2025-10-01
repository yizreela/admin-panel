import { NextRequest, NextResponse } from 'next/server';
import { updateEmployee } from '../../../../lib/google-sheets';

// PUT /api/employees/delete?id=<email> - Soft delete (Estado = 'Eliminado')
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    console.log(`🗑️ PUT /api/employees/delete - ID recibido: ${id}`);
    
    if (!id) {
      console.log('❌ PUT /api/employees/delete - ID no proporcionado');
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    console.log(`🔄 PUT /api/employees/delete - Llamando updateEmployee(${id}, { Estado: 'Eliminado' })`);
    const result = await updateEmployee(id, { Estado: 'Eliminado' });
    console.log(`✅ PUT /api/employees/delete - Soft delete exitoso:`, result);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Empleado marcado como eliminado correctamente',
      employee: result 
    });
  } catch (error) {
    console.error('❌ PUT /api/employees/delete - Error soft-deleting employee:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Error deleting employee' 
    }, { status: 500 });
  }
}


