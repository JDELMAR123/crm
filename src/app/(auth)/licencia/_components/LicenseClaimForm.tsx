"use client";

import { useActionState } from "react";
import { submitLicenseClaim } from "@/lib/actions/license";

const field =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20";

export default function LicenseClaimForm() {
  const [state, formAction, pending] = useActionState(submitLicenseClaim, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Método usado</span>
        <input name="method" placeholder="Zelle, Binance, pago móvil…" className={field} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Referencia / comprobante *</span>
        <input name="reference" required className={field} />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Email o teléfono de contacto</span>
        <input name="contactInfo" className={field} />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
      >
        {pending ? "Enviando…" : "Enviar comprobante"}
      </button>
    </form>
  );
}
