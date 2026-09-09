"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";

export type ContactFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

function parseForm(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!firstName) fieldErrors.firstName = "El nombre es obligatorio.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Email no válido.";
  }

  return {
    data: {
      firstName,
      lastName: lastName || null,
      email: email || null,
      phone: phone || null,
      company: company || null,
      notes: notes || null,
    },
    fieldErrors,
  };
}

export async function createContact(
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  await requireUser();
  const { data, fieldErrors } = parseForm(formData);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  let id: string;
  try {
    const created = await prisma.contact.create({ data });
    id = created.id;
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { fieldErrors: { email: "Ya existe un contacto con ese email." } };
    }
    return { error: "No se pudo crear el contacto." };
  }

  revalidatePath("/contacts");
  revalidatePath("/");
  redirect(`/contacts/${id}`);
}

export async function updateContact(
  id: string,
  _prev: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  await requireUser();
  const { data, fieldErrors } = parseForm(formData);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  try {
    await prisma.contact.update({ where: { id }, data });
  } catch (e) {
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { fieldErrors: { email: "Ya existe un contacto con ese email." } };
    }
    return { error: "No se pudo actualizar el contacto." };
  }

  revalidatePath("/contacts");
  revalidatePath(`/contacts/${id}`);
  revalidatePath("/");
  redirect(`/contacts/${id}`);
}

export async function deleteContact(formData: FormData) {
  await requireUser();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.contact.delete({ where: { id } });
  revalidatePath("/contacts");
  revalidatePath("/");
  redirect("/contacts");
}
