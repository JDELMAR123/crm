import "server-only";

/**
 * Revocación remota "de falla abierta": si configuras LICENSE_REGISTRY_URL
 * (apuntando a tu instalación de referencia, donde generas las claves),
 * cada instalación de cliente consulta una vez al día si su clave fue
 * bloqueada. Si el registro no responde (o no está configurado), NO se
 * bloquea nada — esto es a propósito: la instalación del cliente sigue
 * funcionando aunque tu servidor esté caído, no depende de él para operar
 * día a día, solo para que tú puedas cortarle el acceso si hace falta.
 */
const OK_TTL_MS = 24 * 60 * 60 * 1000; // 1 día: no hay revocación, reintenta mañana
const FAIL_TTL_MS = 15 * 60 * 1000; // 15 min: hubo un fallo, reintenta pronto
const FETCH_TIMEOUT_MS = 3000;

let cache: { blocked: boolean; at: number; ttl: number } | null = null;

export async function isLicenseRemotelyBlocked(key: string): Promise<boolean> {
  const registryUrl = process.env.LICENSE_REGISTRY_URL?.trim();
  if (!registryUrl) return false; // no configurado: nada que revisar

  if (cache && Date.now() - cache.at < cache.ttl) return cache.blocked;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const url = `${registryUrl.replace(/\/+$/, "")}/api/license-status?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, { signal: controller.signal, cache: "no-store" });
    clearTimeout(timer);

    if (!res.ok) {
      cache = { blocked: false, at: Date.now(), ttl: FAIL_TTL_MS };
      return false;
    }
    const data = (await res.json()) as { blocked?: boolean };
    const blocked = data.blocked === true;
    cache = { blocked, at: Date.now(), ttl: OK_TTL_MS };
    return blocked;
  } catch {
    // Sin conexión, timeout, lo que sea: falla abierta, no se bloquea.
    cache = { blocked: false, at: Date.now(), ttl: FAIL_TTL_MS };
    return false;
  }
}
