import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeJwtPayload(token: string): { id: string; email: string; role: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

const publicPaths = [
  "/",
  "/login",
  "/register",
  "/products",
];

const authRequiredPaths = ["/cart", "/orders", "/messages"];

const adminPaths = ["/admin"];

function isPublicPath(pathname: string): boolean {
  if (publicPaths.includes(pathname)) return true;
  if (pathname.startsWith("/products/")) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  if (pathname.startsWith("/api/products") && !pathname.includes("POST")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/favicon")) return true;
  return false;
}

function isApiRoute(pathname: string): boolean {
  return pathname.startsWith("/api/");
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Let API routes handle their own auth (except check here for basic routing)
  if (isApiRoute(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const payload = token ? decodeJwtPayload(token) : null;

  // Check admin routes
  const isAdminRoute = adminPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
  if (isAdminRoute) {
    if (!payload || payload.role !== "ADMIN") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  // Check auth-required routes
  const isAuthRequired = authRequiredPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
  if (isAuthRequired) {
    if (!payload) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
