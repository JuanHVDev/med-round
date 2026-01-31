import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes and static files
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Redirect authenticated users from public routes to dashboard
  if (session && (pathname === '/' || pathname === '/login' || pathname === '/register')) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Redirect to login if not authenticated on protected routes
  if (!session && pathname !== '/' && pathname !== '/login' && pathname !== '/register') {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - static files with extensions
     */
    '/((?!api|_next/static|_next/image|.*\\..*).*)',
  ],
};

// Use Node.js runtime to support Better Auth
export const runtime = 'nodejs';