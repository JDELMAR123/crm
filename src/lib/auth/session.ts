import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

const COOKIE = "crm_session";
const DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

const hashToken = (raw: string) =>
  createHash("sha256").update(raw).digest("hex");

/**
 * Caché en memoria de la instancia para la validación de sesión: el layout
 * de la app comprueba la sesión en cada navegación, y esa consulta es la que
 * más pesa en la latencia percibida de cambiar de panel. Ventana corta —
 * el usuario ya está dentro, no hace falta re-validar contra la base de
 * datos en cada clic.
 */
const sessionCache = new Map<string, { user: User | null; at: number }>();
const SESSION_TTL_MS = 60_000;

function cacheGet(hash: string): User | null | undefined {
  const hit = sessionCache.get(hash);
  if (!hit || Date.now() - hit.at > SESSION_TTL_MS) return undefined;
  return hit.user;
}

function cacheSet(hash: string, user: User | null) {
  sessionCache.set(hash, { user, at: Date.now() });
  // Evita crecer sin límite en una instancia de larga vida.
  if (sessionCache.size > 500) {
    const oldest = sessionCache.keys().next().value;
    if (oldest) sessionCache.delete(oldest);
  }
}

/** Crea una sesión para el usuario y escribe la cookie. Solo en Server Actions / Route Handlers. */
export async function createSession(userId: string): Promise<void> {
  const raw = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + DURATION_MS);

  const session = await prisma.session.create({
    data: { token: hashToken(raw), userId, expiresAt },
    include: { user: true },
  });
  cacheSet(hashToken(raw), session.user);

  const store = await cookies();
  store.set(COOKIE, raw, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/",
  });
}

/** Devuelve el usuario de la sesión actual, o null. Se puede llamar desde cualquier sitio. */
export async function getSessionUser(): Promise<User | null> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (!raw) return null;
  const hash = hashToken(raw);

  const cached = cacheGet(hash);
  if (cached !== undefined) return cached;

  const session = await prisma.session.findUnique({
    where: { token: hash },
    include: { user: true },
  });

  const user =
    !session || session.expiresAt.getTime() < Date.now() ? null : session.user;
  cacheSet(hash, user);
  return user;
}

/** Cierra la sesión actual. Solo en Server Actions / Route Handlers. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (raw) {
    const hash = hashToken(raw);
    await prisma.session.deleteMany({ where: { token: hash } });
    sessionCache.delete(hash);
    store.delete(COOKIE);
  }
}
