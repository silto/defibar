import { NextFetchEvent, NextRequest, NextResponse } from 'next/server';

type Environment = 'production' | 'development' | 'other';

type Params = {
  environments?: Environment[];
  status?: 301 | 302;
};

export function middleware(req: NextRequest, ev: NextFetchEvent) {
  const currentEnv = process.env.NODE_ENV as Environment;

  if (currentEnv === 'production' && req.headers.get('x-forwarded-proto') !== 'https') {
    const hostname = req.headers.get('host') || req.nextUrl.hostname;
    return NextResponse.redirect(`https://${hostname}${req.nextUrl.pathname}`, 301);
  }
  return NextResponse.next();
}
