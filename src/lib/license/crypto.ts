import { sign, verify } from "node:crypto";

/**
 * Clave pública de licencias. Verifica claves firmadas SIN llamar a ningún
 * servidor (offline) — cada instalación puede validar su propia clave por su
 * cuenta, sin depender de que nada esté "en línea" tras la venta.
 *
 * La clave PRIVADA correspondiente nunca vive en este repo ni en ninguna
 * instalación desplegada: solo la tiene el creador, en su máquina, y la usa
 * con `scripts/generate-license-key.ts` para firmar una clave por cada venta.
 */
const PUBLIC_KEY_PEM = `-----BEGIN PUBLIC KEY-----
MCowBQYDK2VwAyEACU/zuHhR4fngDv0CwaFXjRGzKnbql6xm5QGokzCFcNA=
-----END PUBLIC KEY-----
`;

export type LicensePayload = { sub: string; iat: number };

function b64urlToBuffer(s: string): Buffer {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, "+").replace(/_/g, "/") + pad, "base64");
}

function bufferToB64url(b: Buffer): string {
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Firma una clave de licencia con la clave PRIVADA (usa esto SOLO donde
 * tengas la clave privada disponible: el script `generate-license-key.ts`
 * en tu máquina, o el panel /creador de TU propia instalación si le pusiste
 * la variable de entorno `LICENSE_SIGNING_PRIVATE_KEY`). Nunca se usa en
 * las instalaciones de tus clientes.
 */
export function signLicenseKey(label: string, privateKeyPem: string): string {
  const payload: LicensePayload = { sub: label, iat: Math.floor(Date.now() / 1000) };
  const payloadBuf = Buffer.from(JSON.stringify(payload), "utf8");
  const signature = sign(null, payloadBuf, privateKeyPem);
  return `${bufferToB64url(payloadBuf)}.${bufferToB64url(signature)}`;
}

/** Comprueba la firma de una clave de licencia (formato "payload.firma", ambos en base64url). */
export function verifyLicenseKey(
  key: string
): { valid: true; payload: LicensePayload } | { valid: false; payload?: undefined } {
  const trimmed = key.trim();
  const dot = trimmed.indexOf(".");
  if (dot < 1) return { valid: false };

  const payloadB64 = trimmed.slice(0, dot);
  const sigB64 = trimmed.slice(dot + 1);
  if (!payloadB64 || !sigB64) return { valid: false };

  try {
    const payloadBuf = b64urlToBuffer(payloadB64);
    const sig = b64urlToBuffer(sigB64);
    // Ed25519 firma sin algoritmo de hash separado: se pasa null.
    const ok = verify(null, payloadBuf, PUBLIC_KEY_PEM, sig);
    if (!ok) return { valid: false };

    const payload = JSON.parse(payloadBuf.toString("utf8")) as LicensePayload;
    if (typeof payload.sub !== "string" || typeof payload.iat !== "number") {
      return { valid: false };
    }
    return { valid: true, payload };
  } catch {
    return { valid: false };
  }
}
