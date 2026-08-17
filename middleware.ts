import { NextRequest, NextResponse } from "next/server";
import { COOKIE_NAME, parseCookie, ROLE_HOME } from "@/lib/auth-cookie";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes self-protect
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const raw = request.cookies.get(COOKIE_NAME)?.value;
  const session = raw ? parseCookie(raw) : null;

  // Root → redirect based on auth status
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(session ? ROLE_HOME[session.role] : "/login", request.url)
    );
  }

  // Login page: logged-in users go to their dashboard
  if (pathname === "/login") {
    if (session) {
      return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
    }
    return NextResponse.next();
  }

  // Register page: logged-in users go to their dashboard
  if (pathname === "/register") {
    if (session) {
      return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
    }
    return NextResponse.next();
  }

  // All other routes require auth
  if (!session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based path protection
  const roleGuards: Array<[string, "beneficiary" | "specialist" | "supervisor"]> = [
    ["/beneficiary", "beneficiary"],
    ["/specialist", "specialist"],
    ["/supervisor", "supervisor"],
  ];

  for (const [prefix, role] of roleGuards) {
    if (pathname.startsWith(prefix) && session.role !== role) {
      return NextResponse.redirect(new URL(ROLE_HOME[session.role], request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"],
};
