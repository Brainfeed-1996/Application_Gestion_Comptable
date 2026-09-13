import { Middleware } from 'next';

export const middleware: Middleware = async (request) => {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;

  const protectedPaths = ['/dashboard', '/transactions', '/invoices', '/clients', '/reports', '/settings'];
  const authPaths = ['/login', '/register', '/two-factor', '/oauth'];

  if (protectedPaths.some((p) => pathname.startsWith(p)) && !token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return Response.redirect(url);
  }

  if (authPaths.some((p) => pathname.startsWith(p)) && token) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return Response.redirect(url);
  }

  return;
};

export const config = {
  matcher: ['/dashboard/:path*', '/transactions/:path*', '/invoices/:path*', '/clients/:path*', '/reports/:path*', '/settings/:path*', '/login', '/register', '/two-factor', '/oauth/:path*'],
};
