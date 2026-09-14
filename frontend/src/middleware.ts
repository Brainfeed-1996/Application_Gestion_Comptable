import { NextResponse } from "next/server";

export async function middleware(request: Request) {
  const { pathname } = new URL(request.url);

  const publicPaths = ["/login", "/register", "/api"];
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.headers.get("cookie")?.includes("accessToken=");
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
