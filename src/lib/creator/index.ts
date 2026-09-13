import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { getCurrentUser } from "@/lib/auth";
import { CREATOR_EMAIL, isCreatorEmail } from "./email";

export { CREATOR_EMAIL, isCreatorEmail };

// Se llama desde el layout protegido, es decir, en TODAS las navegaciones.
// Una vez confirmado que la cuenta existe (o que no hay que crearla), no
// tiene sentido volver a consultar la base de datos en cada clic: se
// recuerda el resultado en memoria mientras viva esta instancia.
let creatorChecked = false;

/**
 * Crea la cuenta del creador si están definidas CREATOR_EMAIL + CREATOR_PASSWORD
 * y aún no existe. Pensado para llamarse antes del login.
 */
export const ensureCreatorAccount = cache(async (): Promise<void> => {
  if (creatorChecked) return;

  const password = process.env.CREATOR_PASSWORD;
  if (!password || !CREATOR_EMAIL) {
    creatorChecked = true;
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email: CREATOR_EMAIL } });
  if (!existing) {
    await prisma.user.create({
      data: {
        email: CREATOR_EMAIL,
        name: "Creador",
        passwordHash: await hashPassword(password),
        role: "ADMIN",
      },
    });
  }
  creatorChecked = true;
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
