import "server-only";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { User } from "@/generated/prisma/client";

const COOKIE = "crm_session";
const DURATION_MS = 1000 * 60 * 60 * 24 * 30; // 30 días

const hashToken = (raw: string) =>
  createHash("sha256").update(raw).digest("hex");

/** Crea una sesión para el usuario y escribe la cookie. Solo en Server Actions / Route Handlers. */
export async function createSession(userId: string): Promise<void> {
  const raw = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + DURATION_MS);

  await prisma.session.create({
    data: { token: hashToken(raw), userId, expiresAt },
  });

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

  const session = await prisma.session.findUnique({
    where: { token: hashToken(raw) },
    include: { user: true },
  });

  if (!session || session.expiresAt.getTime() < Date.now()) {
    return null;
  }
  return session.user;
}

/** Cierra la sesión actual. Solo en Server Actions / Route Handlers. */
export async function destroySession(): Promise<void> {
  const store = await cookies();
  const raw = store.get(COOKIE)?.value;
  if (raw) {
    await prisma.session.deleteMany({ where: { token: hashToken(raw) } });
    store.delete(COOKIE);
  }
}
