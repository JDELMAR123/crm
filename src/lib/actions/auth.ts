"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { hasAnyUser, requireAdmin } from "@/lib/auth";

export type AuthState = { error?: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) return { error: "Introduce tu email y contraseña." };

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return { error: "Email o contraseña incorrectos." };
  }

  await createSession(user.id);
  redirect("/");
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

/** Crea el primer usuario (administrador). Solo funciona si no hay usuarios. */
export async function setupAdmin(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  if (await hasAnyUser()) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!name) return { error: "Introduce tu nombre." };
  if (!EMAIL_RE.test(email)) return { error: "Email no válido." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await hashPassword(password), role: "ADMIN" },
  });

  await createSession(user.id);
  redirect("/");
}

// --- Gestión del equipo (solo admin) --------------------------------------

export async function createTeamUser(
  _prev: AuthState,
  formData: FormData
): Promise<AuthState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = (String(formData.get("role") ?? "AGENTE") as UserRole);

  if (!name) return { error: "Introduce el nombre." };
  if (!EMAIL_RE.test(email)) return { error: "Email no válido." };
  if (password.length < 8) return { error: "La contraseña debe tener al menos 8 caracteres." };

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { error: "Ya existe un usuario con ese email." };

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash: await hashPassword(password),
      role: role === "ADMIN" ? "ADMIN" : "AGENTE",
    },
  });
  revalidatePath("/equipo");
  return {};
}

export async function deleteTeamUser(formData: FormData): Promise<void> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id || id === admin.id) return;

  // No dejar el CRM sin ningún administrador.
  const target = await prisma.user.findUnique({ where: { id } });
  if (target?.role === "ADMIN") {
    const admins = await prisma.user.count({ where: { role: "ADMIN" } });
    if (admins <= 1) return;
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/equipo");
}
