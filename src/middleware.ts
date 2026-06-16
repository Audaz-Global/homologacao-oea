import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  // Protege a rota /admin e qualquer sub-rota dela
  if (url.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      // Obtém o usuário e senha das variáveis de ambiente ou usa um padrão
      const validUser = process.env.ADMIN_USER || 'admin';
      const validPassword = process.env.ADMIN_PASSWORD || 'Audaz2026';

      if (user === validUser && pwd === validPassword) {
        return NextResponse.next();
      }
    }

    // Se falhar, pede as credenciais mostrando um pop-up padrão do navegador
    return new NextResponse('Acesso restrito. Autenticação necessária.', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Dashboard Audaz Global"',
      },
    });
  }

  return NextResponse.next();
}

// Configura o middleware para rodar apenas nas rotas necessárias para otimizar a performance
export const config = {
  matcher: ['/admin/:path*'],
};
