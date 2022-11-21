import { NextRequest, NextResponse } from 'next/server';

type Environment = 'production' | 'development' | 'other';

export function middleware(req: NextRequest) {
  const currentEnv = process.env.NODE_ENV as Environment;
  const disableHttpsRedirect = process.env.DISABLE_HTTPS_REDIRECT === 'true';
  if (currentEnv === 'production' && !disableHttpsRedirect && req.headers.get('x-forwarded-proto') !== 'https') {
    const hostname = req.headers.get('host') || req.nextUrl.hostname;
    return NextResponse.redirect(`https://${hostname}${req.nextUrl.pathname}`, 301);
  }
  return NextResponse.next();
}
