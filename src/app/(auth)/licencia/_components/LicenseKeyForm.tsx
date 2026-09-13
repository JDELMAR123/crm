"use client";

import { useActionState } from "react";
import { submitLicenseKey } from "@/lib/actions/license";

export default function LicenseKeyForm() {
  const [state, formAction, pending] = useActionState(submitLicenseKey, {});

  return (
    <form action={formAction} className="flex flex-col gap-2 sm:flex-row">
      <input
        name="licenseKey"
        placeholder="Pega aquí tu clave de licencia"
        className="flex-1 rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
      >
        {pending ? "Verificando…" : "Activar"}
      </button>
      {state.error && (
        <p className="w-full text-xs text-red-600 dark:text-red-400">{state.error}</p>
      )}
    </form>
  );
}
