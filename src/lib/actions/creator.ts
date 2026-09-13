"use server";

import { revalidatePath } from "next/cache";
import { requireCreator } from "@/lib/creator";
import { prisma } from "@/lib/prisma";
import { updateSettings } from "@/lib/settings";
import type { ModuleName } from "@/lib/settings";

export type CreatorState = { ok?: boolean; error?: string };

const ALL_MODULES: ModuleName[] = ["inbox", "pipeline", "ia"];

export async function saveModules(
  _prev: CreatorState,
  formData: FormData
): Promise<CreatorState> {
  await requireCreator();
  // Un checkbox marcado = módulo ACTIVO. Los no marcados van a disabledModules.
  const disabled = ALL_MODULES.filter((m) => formData.get(`mod_${m}`) !== "on");
  await updateSettings({ disabledModules: JSON.stringify(disabled) });
  revalidatePath("/", "layout");
  revalidatePath("/creador");
  return { ok: true };
}

export async function saveNotice(
  _prev: CreatorState,
  formData: FormData
): Promise<CreatorState> {
  await requireCreator();
  const text = String(formData.get("creatorNotice") ?? "").trim();
  await updateSettings({ creatorNotice: text || null });
  revalidatePath("/", "layout");
  revalidatePath("/creador");
  return { ok: true };
}

/** Precio + instrucciones de pago + interruptor de cobro para esta instalación. */
export async function saveLicenseConfig(
  _prev: CreatorState,
  formData: FormData
): Promise<CreatorState> {
  await requireCreator();
  const enabled = formData.get("licenseEnabled") === "on";
  const priceLabel = String(formData.get("licensePriceLabel") ?? "").trim();
  const instructions = String(formData.get("licensePaymentInstructions") ?? "").trim();

  if (enabled && (!priceLabel || !instructions)) {
    return { error: "Pon el precio y las instrucciones de pago antes de activar el cobro." };
  }

  await updateSettings({
    licenseEnabled: enabled,
    licensePriceLabel: priceLabel || null,
    licensePaymentInstructions: instructions || null,
  });
  revalidatePath("/", "layout");
  revalidatePath("/creador");
  revalidatePath("/licencia");
  return { ok: true };
}

/** Aprueba un comprobante: desbloquea la instalación entera (pago único por instancia). */
export async function approveLicenseClaim(formData: FormData): Promise<void> {
  await requireCreator();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.licensePaymentClaim.update({
    where: { id },
    data: { status: "approved", reviewedAt: new Date() },
  });
  await updateSettings({ licensePaid: true });
  revalidatePath("/creador");
  revalidatePath("/licencia");
}

/** Rechaza un comprobante; el comprador puede volver a intentarlo desde /licencia. */
export async function rejectLicenseClaim(formData: FormData): Promise<void> {
  await requireCreator();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const note = String(formData.get("note") ?? "").trim() || null;

  await prisma.licensePaymentClaim.update({
    where: { id },
    data: { status: "rejected", reviewedAt: new Date(), note },
  });
  revalidatePath("/creador");
  revalidatePath("/licencia");
}
