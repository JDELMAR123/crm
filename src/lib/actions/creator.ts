"use server";

import { revalidatePath } from "next/cache";
import { requireCreator } from "@/lib/creator";
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
