import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const token = process.env.WEBHOOK_SECRET_TOKEN;
  
  return NextResponse.json({
    message: 'Test webhook endpoint',
    tokenConfigured: !!token,
    tokenValue: token ? `${token.substring(0, 10)}...` : 'Not configured',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  const secretToken = request.headers.get('X-Secret-Token');
  const expectedToken = process.env.WEBHOOK_SECRET_TOKEN;
  
  return NextResponse.json({
    message: 'Test webhook POST',
    receivedToken: secretToken ? `${secretToken.substring(0, 10)}...` : 'Not provided',
    expectedToken: expectedToken ? `${expectedToken.substring(0, 10)}...` : 'Not configured',
    tokensMatch: secretToken === expectedToken,
    timestamp: new Date().toISOString()
  });
}
