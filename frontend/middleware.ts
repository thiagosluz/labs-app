import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar se tem session do Laravel (cookie laravel-session)
  const laravelSession = request.cookies.get('laravel-session')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isPublicPage = request.nextUrl.pathname === '/' || isLoginPage;

  // Se não tem session e está tentando acessar página protegida
  if (!laravelSession && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Se tem session e está na página de login, redirecionar para dashboard
  if (laravelSession && isLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

