import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CREATOR_EMAIL } from "@/lib/creator/email";
import { getSessionUser } from "./session";

/** Usuario actual (cacheado por request). */
export const getCurrentUser = cache(getSessionUser);

/** Exige sesión; si no hay, redirige a /login. */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}

/** Exige rol ADMIN; si no, redirige al panel. */
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") redirect("/");
  return user;
}

/**
 * ¿Existe ya algún usuario "real" (no el creador)? Decide asistente vs login.
 * La cuenta del creador no cuenta: el cliente debe crear su propio administrador.
 */
export const hasAnyUser = cache(async () => {
  const count = await prisma.user.count({
    where: { email: { not: CREATOR_EMAIL } },
  });
  return count > 0;
});
