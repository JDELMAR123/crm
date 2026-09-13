"use server";

import { revalidatePath } from "next/cache";
import { requireCreator } from "@/lib/creator";
import { prisma } from "@/lib/prisma";
import { updateSettings } from "@/lib/settings";
import { verifyLicenseKey } from "@/lib/license/crypto";
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

/**
 * Marca un comprobante como aprobado (registro, para saber a quién ya le
 * generaste la clave). NO desbloquea nada por sí solo: eso lo hace
 * `saveLicenseKey` una vez pegues aquí mismo la clave que firmaste con
 * `scripts/generate-license-key.ts` en tu máquina.
 */
export async function approveLicenseClaim(formData: FormData): Promise<void> {
  await requireCreator();
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  await prisma.licensePaymentClaim.update({
    where: { id },
    data: { status: "approved", reviewedAt: new Date() },
  });
  revalidatePath("/creador");
}

/** El creador activa la instalación pegando aquí la clave que firmó localmente. */
export async function saveLicenseKey(
  _prev: CreatorState,
  formData: FormData
): Promise<CreatorState> {
  await requireCreator();

  // Casilla explícita para quitar la clave: un envío vacío por descuido no
  // debe poder revocar un desbloqueo ya pagado.
  if (formData.get("licenseKey__clear") === "on") {
    await updateSettings({ licenseKey: null });
    revalidatePath("/creador");
    revalidatePath("/", "layout");
    return { ok: true };
  }

  const key = String(formData.get("licenseKey") ?? "").trim();
  if (!key) return { error: "Pega una clave o marca la casilla para quitarla." };

  const result = verifyLicenseKey(key);
  if (!result.valid) {
    return { error: "Esa clave no es válida (revisa que la copiaste completa)." };
  }

  await updateSettings({ licenseKey: key });
  revalidatePath("/creador");
  revalidatePath("/", "layout");
  revalidatePath("/licencia");
  return { ok: true };
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
