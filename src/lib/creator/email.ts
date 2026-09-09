/**
 * Acceso de creador (panel /creador).
 *
 * Se activa SOLO si defines las dos variables de entorno al desplegar:
 *   CREATOR_EMAIL     — el correo con el que entrarás al panel
 *   CREATOR_PASSWORD  — la contraseña de esa cuenta (se crea al arrancar)
 *
 * Si CREATOR_EMAIL no está definida, la función de creador queda desactivada
 * y el CRM funciona igual (solo login normal + admin del cliente).
 */
export const CREATOR_EMAIL = (process.env.CREATOR_EMAIL || "").toLowerCase();

export function isCreatorEmail(email: string): boolean {
  return CREATOR_EMAIL !== "" && email.toLowerCase() === CREATOR_EMAIL;
}
