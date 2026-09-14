/**
 * Genera una clave de licencia firmada para un cliente. Solo la usas TÚ,
 * en tu máquina — nunca se ejecuta dentro de una instalación desplegada.
 *
 * Uso:
 *   node --experimental-strip-types scripts/generate-license-key.ts <archivo-clave-privada.pem> "<etiqueta, ej. email del cliente>"
 *
 * Alternativa más cómoda: si en TU instalación de referencia configuras la
 * variable de entorno `LICENSE_SIGNING_PRIVATE_KEY`, aparece un generador
 * directamente en /creador — no hace falta ni terminal ni este script.
 *
 * La clave privada es la que te mostró Claude una única vez al crear el
 * sistema de licencias. Guárdala en un gestor de contraseñas y, si quieres
 * tenerla también en un archivo local para usar este script, ponla en un
 * archivo (p. ej. `license-private-key.pem` en la raíz del proyecto) — ese
 * nombre ya está en `.gitignore`, así que nunca se subirá por accidente.
 */
import { readFileSync } from "node:fs";
import { signLicenseKey } from "../src/lib/license/crypto.ts";

function main() {
  const [, , keyPath, label] = process.argv;
  if (!keyPath || !label) {
    console.error(
      'Uso: node --experimental-strip-types scripts/generate-license-key.ts <clave-privada.pem> "<etiqueta>"'
    );
    process.exit(1);
  }

  const privateKeyPem = readFileSync(keyPath, "utf8");
  const licenseKey = signLicenseKey(label, privateKeyPem);

  console.log("\nClave de licencia (pégasela al cliente / o pégala tú en su panel de Creador):\n");
  console.log(licenseKey);
  console.log();
}

main();
