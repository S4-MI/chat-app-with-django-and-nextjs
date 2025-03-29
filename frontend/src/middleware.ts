import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected routes - require authentication
const protectedRoutes = ["/app", "/app/chat"];

// Auth routes - redirect to dashboard if already logged in
const authRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for static assets and API routes
    if (pathname.startsWith("/_next") || pathname.startsWith("/api") || pathname.includes(".")) {
        return NextResponse.next();
    }

    const token = request.cookies.get("token");

    const isAuthenticated = !!token;

    const isProtectedRoute = protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

    const isAuthRoute = authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));

    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthRoute && isAuthenticated) {
        return NextResponse.redirect(new URL("/app", request.url));
    }

    return NextResponse.next();
}

// Only run middleware on specific paths
export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
