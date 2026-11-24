import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "admin_session";

/**
 * Optimistic auth check: every page except /login needs the session cookie.
 * Real verification happens server-side (requireSession) and in the API.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE)?.value);

  if (!hasSession && pathname !== "/login") {
    const url = new URL("/login", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }
  if (hasSession && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!_next|_vercel|favicon.ico|robots.txt|placeholders|.*\\..*).*)",
};
