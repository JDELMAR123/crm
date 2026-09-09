"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { updateSettings } from "@/lib/settings";
import type { CatalogEntry } from "@/lib/settings/defaults";

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

export async function saveBusiness(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const businessName = String(formData.get("businessName") ?? "").trim();
  if (!businessName) return { error: "El nombre no puede estar vacío." };
  await updateSettings({ businessName });
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

function parseCatalog(raw: string): CatalogEntry[] {
  const out: CatalogEntry[] = [];
  for (const line of raw.split("\n")) {
    const t = line.trim();
    if (!t) continue;
    const [name, kw = ""] = t.split(":");
    const keywords = kw
      .split(",")
      .map((k) => k.trim().toLowerCase())
      .filter(Boolean);
    if (name.trim()) {
      out.push({
        name: name.trim(),
        keywords: keywords.length ? keywords : [name.trim().toLowerCase()],
      });
    }
  }
  return out;
}

export async function saveCatalog(
  _prev: SettingsState,
  formData: FormData
): Promise<SettingsState> {
  await requireAdmin();
  const catalog = parseCatalog(String(formData.get("catalog") ?? ""));
  const colors = String(formData.get("colors") ?? "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);

  if (catalog.length === 0) return { error: "Añade al menos un producto." };

  await updateSettings({
    productCatalog: JSON.stringify(catalog),
    colorWords: JSON.stringify(colors),
  });
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
