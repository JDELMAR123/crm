/**
 * Genera una clave de licencia firmada para un cliente. Solo la usas TÚ,
 * en tu máquina — nunca se ejecuta dentro de una instalación desplegada.
 *
 * Uso:
 *   node --experimental-strip-types scripts/generate-license-key.ts <archivo-clave-privada.pem> "<etiqueta, ej. email del cliente>"
 *
 * La clave privada es la que te mostró Claude una única vez al crear el
 * sistema de licencias. Guárdala en un gestor de contraseñas y, si quieres
 * tenerla también en un archivo local para usar este script, ponla en un
 * archivo (p. ej. `license-private-key.pem` en la raíz del proyecto) — ese
 * nombre ya está en `.gitignore`, así que nunca se subirá por accidente.
 */
import { readFileSync } from "node:fs";
import { sign } from "node:crypto";

function bufferToB64url(b: Buffer): string {
  return b.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function main() {
  const [, , keyPath, label] = process.argv;
  if (!keyPath || !label) {
    console.error(
      'Uso: node --experimental-strip-types scripts/generate-license-key.ts <clave-privada.pem> "<etiqueta>"'
    );
    process.exit(1);
  }

  const privateKeyPem = readFileSync(keyPath, "utf8");
  const payload = { sub: label, iat: Math.floor(Date.now() / 1000) };
  const payloadBuf = Buffer.from(JSON.stringify(payload), "utf8");
  const signature = sign(null, payloadBuf, privateKeyPem);

  const licenseKey = `${bufferToB64url(payloadBuf)}.${bufferToB64url(signature)}`;

  console.log("\nClave de licencia (pégasela al cliente / o pégala tú en su panel de Creador):\n");
  console.log(licenseKey);
  console.log();
}

main();
