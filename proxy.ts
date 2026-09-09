import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Comprobación "optimista": solo mira si existe la cookie de sesión.
// La validación real (contra la base de datos) la hace el layout protegido.
const PUBLIC_PREFIXES = ["/login", "/setup"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Los webhooks de Meta son públicos por diseño.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  const hasSession = request.cookies.has("crm_session");
  const isPublic = PUBLIC_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (!hasSession && !isPublic) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (hasSession && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg$).*)"],
};
