import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { verifySessionEdge } from "./lib/auth-edge";

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Extract locale if present (default to 'en')
  const localeMatch = pathname.match(/^\/(en|ur)(\/|$)/);
  const locale = localeMatch ? localeMatch[1] : "en";

  // Normalize path without locale
  const pathWithoutLocale = pathname.replace(/^\/(en|ur)/, "") || "/";

  const isAdminRoute =
    pathWithoutLocale === "/admin-dashboard" ||
    pathWithoutLocale.startsWith("/admin-dashboard/") ||
    pathWithoutLocale === "/admin" ||
    pathWithoutLocale.startsWith("/admin/");

  const isUserRoute =
    pathWithoutLocale === "/user-dashboard" ||
    pathWithoutLocale.startsWith("/user-dashboard/");

  // Check auth session cookie
  const sessionCookie = request.cookies.get("lahore_dental_session")?.value;
  const session = sessionCookie ? await verifySessionEdge(sessionCookie) : null;

  // 1. Strict Admin Route Protection: Users must not be able to access the admin dashboard
  if (isAdminRoute) {
    if (!session) {
      // Unauthenticated user -> redirect to home page with notice
      const redirectUrl = new URL(`/${locale}?auth=required`, request.url);
      return NextResponse.redirect(redirectUrl);
    }

    if (session.role !== "admin") {
      // Authenticated but normal user role -> forbidden from admin dashboard, redirect to user dashboard
      const redirectUrl = new URL(`/${locale}/user-dashboard?error=admin_only`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // 2. User Dashboard Protection
  if (isUserRoute) {
    if (!session) {
      const redirectUrl = new URL(`/${locale}?auth=required`, request.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Pass through to next-intl middleware for internationalization routing
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames, skipping api, _next, static assets
  matcher: ["/", "/(en|ur)/:path*", "/((?!api|_next|_vercel|.*\\..*).*)"],
};
