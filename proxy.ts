import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Comprobación "optimista": solo mira si existe la cookie de sesión.
// La validación real (contra la base de datos) la hace el layout protegido.
const PUBLIC_PREFIXES = ["/login", "/setup"];
// /licencia se deja pasar SIEMPRE, con o sin sesión: un cliente ya logueado
// cuya licencia fue revocada también debe poder verla (si no, "hasSession
// && isPublic → a /" lo rebotaría en bucle contra el layout protegido, que
// lo manda de vuelta a /licencia). La página decide con datos reales si
// hay algo que mostrar ahí o si redirige a otro lado.
const ALWAYS_ALLOWED = ["/licencia"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Los webhooks de Meta son públicos por diseño.
  if (pathname.startsWith("/api/")) return NextResponse.next();

  if (ALWAYS_ALLOWED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

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
