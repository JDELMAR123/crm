"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { updateSettings } from "@/lib/settings";

export type SettingsState = { ok?: boolean; error?: string };

function revalidateAll() {
  revalidatePath("/ajustes");
  revalidatePath("/", "layout");
}

/** Campo secreto: vacío = no cambiar; con "borrar" marcado = poner a null. */
function secret(formData: FormData, name: string): string | null | undefined {
  if (formData.get(`${name}__clear`) === "on") return null;
  const v = String(formData.get(name) ?? "").trim();
  return v ? v : undefined;
}

const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif"];
const LOGO_MAX = 256 * 1024;

export async function saveBrand(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();

  const businessName = String(formData.get("businessName") ?? "").trim();
  if (!businessName) return { error: "El nombre no puede estar vacío." };

  const colorRaw = String(formData.get("brandColor") ?? "").trim();
  const brandColor =
    formData.get("brandColor__off") === "on" || !/^#[0-9a-fA-F]{6}$/.test(colorRaw)
      ? null
      : colorRaw.toLowerCase();

  const data: Parameters<typeof updateSettings>[0] = { businessName, brandColor };

  if (formData.get("logo__clear") === "on") {
    data.logo = null;
  } else {
    const file = formData.get("logo");
    if (file instanceof File && file.size > 0) {
      if (file.size > LOGO_MAX) return { error: "El logo no puede superar 256 KB." };
      if (!LOGO_TYPES.includes(file.type)) {
        return { error: "Formato no admitido. Usa PNG, JPG, WEBP o SVG." };
      }
      const b64 = Buffer.from(await file.arrayBuffer()).toString("base64");
      data.logo = `data:${file.type};base64,${b64}`;
    }
  }

  await updateSettings(data);
  revalidateAll();
  return { ok: true };
}

export async function saveAi(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const aiProvider =
    String(formData.get("aiProvider") ?? "simulation") === "anthropic"
      ? "anthropic"
      : "simulation";
  const aiModel = String(formData.get("aiModel") ?? "").trim() || "claude-opus-5";
  const aiBusinessContext = String(formData.get("aiBusinessContext") ?? "").trim();
  const aiApiKey = secret(formData, "aiApiKey");

  if (aiProvider === "anthropic" && aiApiKey === undefined) {
    // Se permite si ya había una clave guardada; el check real lo hace getSettings.
  }

  await updateSettings({
    aiProvider,
    aiModel,
    aiBusinessContext,
    ...(aiApiKey !== undefined ? { aiApiKey } : {}),
  });
  revalidateAll();
  return { ok: true };
}

export async function saveColors(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const colors = String(formData.get("colors") ?? "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  await updateSettings({ colorWords: JSON.stringify(colors) });
  revalidateAll();
  return { ok: true };
}

export async function saveChannels(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const metaVerifyToken = secret(formData, "metaVerifyToken");
  const waToken = secret(formData, "waToken");
  const waPhoneId = secret(formData, "waPhoneId");
  const igToken = secret(formData, "igToken");
  const igAccountId = secret(formData, "igAccountId");

  await updateSettings({
    ...(metaVerifyToken !== undefined ? { metaVerifyToken } : {}),
    ...(waToken !== undefined ? { waToken } : {}),
    ...(waPhoneId !== undefined ? { waPhoneId } : {}),
    ...(igToken !== undefined ? { igToken } : {}),
    ...(igAccountId !== undefined ? { igAccountId } : {}),
  });
  revalidateAll();
  return { ok: true };
}
