import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Verificar se tem session do Laravel (cookie laravel-session)
  const laravelSession = request.cookies.get('laravel-session')?.value;
  const isLoginPage = request.nextUrl.pathname === '/login';
  const isPublicPage = request.nextUrl.pathname === '/' || isLoginPage;
  
  // Permitir acesso público às páginas de equipamentos via QR code
  const isEquipamentoPublic = request.nextUrl.pathname.startsWith('/equipamento/') && 
                                request.nextUrl.pathname.endsWith('/public');

  // Se é uma página pública de equipamento, permitir acesso
  if (isEquipamentoPublic) {
    return NextResponse.next();
  }

  // SEMPRE permitir acesso à página de login (para logout funcionar corretamente)
  if (isLoginPage) {
    return NextResponse.next();
  }

  // Se não tem session e está tentando acessar página protegida
  if (!laravelSession && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

