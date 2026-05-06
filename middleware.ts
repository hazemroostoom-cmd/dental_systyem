import { NextRequest, NextResponse } from 'next/server';

// This middleware runs for all requests
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Only protect these routes
  const protectedRoutes = ['/dashboard', '/cases'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Allow all other routes (including /login and /)
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Check for auth cookie/token (Firebase auth sets these)
  const authToken = request.cookies.get('__session')?.value;
  
  // If no auth token and trying to access protected route, redirect to login
  if (!authToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
