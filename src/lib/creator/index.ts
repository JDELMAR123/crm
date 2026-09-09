import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getCurrentUser } from "@/lib/auth";
import { CREATOR_EMAIL, isCreatorEmail } from "./email";

export { CREATOR_EMAIL, isCreatorEmail };

/**
 * Crea la cuenta del creador si están definidas CREATOR_EMAIL + CREATOR_PASSWORD
 * y aún no existe. Pensado para llamarse antes del login.
 */
export const ensureCreatorAccount = cache(async (): Promise<void> => {
  const password = process.env.CREATOR_PASSWORD;
  if (!password || !CREATOR_EMAIL) return;

  const existing = await prisma.user.findUnique({ where: { email: CREATOR_EMAIL } });
  if (existing) return;

  await prisma.user.create({
    data: {
      email: CREATOR_EMAIL,
      name: "Creador",
      passwordHash: await hashPassword(password),
      role: "ADMIN",
    },
  });
});

/** Usuario actual si es el creador; si no, null. */
export async function getCreator() {
  const user = await getCurrentUser();
  return user && isCreatorEmail(user.email) ? user : null;
}

/** Exige que quien accede sea el creador. */
export async function requireCreator() {
  const user = await getCreator();
  if (!user) redirect("/");
  return user;
}
