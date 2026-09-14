import { prisma } from "@/lib/prisma";

/**
 * Consultada por las instalaciones de clientes (si configuraron
 * LICENSE_REGISTRY_URL apuntando aquí) para saber si su clave sigue activa.
 * Pública a propósito: la instalación del cliente no tiene ninguna
 * credencial tuya, solo su propia clave de licencia. No expone nada más
 * que "bloqueada sí/no" para esa clave exacta.
 */
export async function GET(request: Request) {
  const key = new URL(request.url).searchParams.get("key")?.trim();
  if (!key) {
    return Response.json({ blocked: false }, { status: 400 });
  }

  const record = await prisma.issuedLicense.findUnique({ where: { key } });
  return Response.json(
    { blocked: record?.revoked ?? false },
    { headers: { "Cache-Control": "no-store" } }
  );
}
