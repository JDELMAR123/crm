"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings, updateSettings } from "@/lib/settings";
import { verifyLicenseKey } from "@/lib/license/crypto";

export type LicenseClaimState = { error?: string };
export type LicenseKeyState = { error?: string };

const CLAIM_COOKIE = "crm_license_claim";

/** El comprador envía su comprobante de pago. Queda pendiente de revisión. */
export async function submitLicenseClaim(
  _prev: LicenseClaimState,
  formData: FormData
): Promise<LicenseClaimState> {
  const settings = await getSettings();
  if (!settings.license.locked) redirect("/setup");

  const reference = String(formData.get("reference") ?? "").trim();
  const method = String(formData.get("method") ?? "").trim() || null;
  const contactInfo = String(formData.get("contactInfo") ?? "").trim() || null;

  if (!reference) {
    return { error: "Escribe la referencia o el número de comprobante del pago." };
  }

  const claim = await prisma.licensePaymentClaim.create({
    data: { reference, method, contactInfo },
  });

  const store = await cookies();
  store.set(CLAIM_COOKIE, claim.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 90, // 90 días: de sobra para que se revise el pago
    path: "/",
  });

  redirect("/licencia");
}

/** El comprobante enviado en este navegador, si hay uno. */
export async function getMyLicenseClaim() {
  const store = await cookies();
  const id = store.get(CLAIM_COOKIE)?.value;
  if (!id) return null;
  return prisma.licensePaymentClaim.findUnique({ where: { id } });
}

/** Permite intentarlo de nuevo tras un rechazo. */
export async function retryLicenseClaim(): Promise<void> {
  const store = await cookies();
  store.delete(CLAIM_COOKIE);
  redirect("/licencia");
}

/**
 * El comprador (o el creador) pega la clave de licencia que el creador le
 * dio tras confirmar el pago. Se valida sin conexión, con la clave pública
 * incluida en el código — no hace falta ningún servidor para desbloquear.
 */
export async function submitLicenseKey(
  _prev: LicenseKeyState,
  formData: FormData
): Promise<LicenseKeyState> {
  const settings = await getSettings();
  if (!settings.license.locked) redirect("/setup");

  const key = String(formData.get("licenseKey") ?? "").trim();
  if (!key) return { error: "Pega la clave de licencia." };

  const result = verifyLicenseKey(key);
  if (!result.valid) {
    return { error: "Esa clave no es válida. Revisa que la copiaste completa." };
  }

  await updateSettings({ licenseKey: key });
  redirect("/setup");
}
