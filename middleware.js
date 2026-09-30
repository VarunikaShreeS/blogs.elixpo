import { NextResponse } from 'next/server';

const PROTECTED_PATHS = ['/settings', '/new-blog', '/notifications', '/edit', '/intro', '/library', '/stats'];
const NOINDEX_PATHS = [...PROTECTED_PATHS, '/profile', '/stories', '/callback', '/auth-error', '/org/join'];

const pathMatches = (pathname, prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`);

const APP_ROUTES = new Set([
  'about', 'api', 'callback', 'edit', 'explore', 'feed', 'handle', 'intro', 'library',
  'login', 'new-blog', 'notifications', 'profile', 'pricing', 'register', 'settings',
  'sign-in', 'sign-up', 'stats', 'stories', 'org',
  'help', 'docs', 'privacy', 'terms',
  'tag', 'auth-error',
  'feed.xml', 'sitemap.xml', 'robots.txt',
  '_next', 'favicon.ico', 'logo.png', 'logo-dark.png', 'logo-light.png', 'base-logo.png',
]);

export function middleware(request) {
  const { pathname } = request.nextUrl;

  const segments = pathname.split('/').filter(Boolean);
  const firstSegment = segments[0] || '';

  
  const noindex = NOINDEX_PATHS.some((p) => pathMatches(pathname, p));
  const isProtected = PROTECTED_PATHS.some((p) => pathMatches(pathname, p));
  if (isProtected) {
    const session = request.cookies.get('lixblogs_session')?.value;
    if (!session) {
      const signIn = new URL('/api/auth/login', request.url);
      signIn.searchParams.set('next', pathname);
      const redirect = NextResponse.redirect(signIn);
      redirect.headers.set('X-Robots-Tag', 'noindex, nofollow');
      redirect.headers.set('X-Content-Type-Options', 'nosniff');
      return redirect;
    }
  }

  const response = NextResponse.next();
  if (noindex) response.headers.set('X-Robots-Tag', 'noindex, nofollow');

  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (firstSegment && !APP_ROUTES.has(firstSegment) && !firstSegment.startsWith('_')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|api/).*)'],
};
