import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/contact"];

// Quick redirects based on the session cookie. This only looks at the cookie:
// real checks happen in requireUser() and in every API route.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(getSessionCookie(request));
  if (pathname === "/" && hasSession) {
    return NextResponse.redirect(new URL("/home", request.url));
  }
  if (!PUBLIC_PATHS.includes(pathname) && !hasSession) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|icon.svg|icon-|apple-icon|manifest.webmanifest).*)",
  ],
};
