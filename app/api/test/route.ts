import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'Test endpoint funcionando',
    timestamp: new Date().toISOString()
  });
}
