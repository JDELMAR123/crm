import "server-only";
import { redirect } from "next/navigation";
import { isModuleEnabled, type ModuleName } from "@/lib/settings";

/** Redirige al inicio si el módulo está desactivado por el creador. */
export async function assertModule(name: ModuleName): Promise<void> {
  if (!(await isModuleEnabled(name))) redirect("/");
}
