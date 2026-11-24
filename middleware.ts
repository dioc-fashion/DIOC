import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host')?.split(':')[0].toLowerCase();
  const { pathname } = request.nextUrl;
  if (pathname === '/api/admin' || pathname.startsWith('/api/admin/')) {
    return NextResponse.json({ error: 'The cloud admin API has been retired. Use DIOC Local Administration.' }, { status: 410 });
  }
  if (hostname === 'admin.dioc.eu.org' || hostname === 'admin.dioc.co.ke') {
    return NextResponse.redirect(new URL('/local-admin', 'https://dioc.eu.org'));
  }
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    return NextResponse.redirect(new URL('/local-admin', request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
