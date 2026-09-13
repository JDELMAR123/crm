"use client";

import { useActionState } from "react";
import {
  saveLicenseConfig,
  approveLicenseClaim,
  rejectLicenseClaim,
  type CreatorState,
} from "@/lib/actions/creator";

const field =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20";

function Status({ state }: { state: CreatorState }) {
  if (state.ok) return <span className="text-sm text-green-600 dark:text-green-400">Guardado ✓</span>;
  if (state.error) return <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>;
  return null;
}

export function LicenseConfigForm({
  enabled,
  paid,
  priceLabel,
  instructions,
}: {
  enabled: boolean;
  paid: boolean;
  priceLabel: string | null;
  instructions: string | null;
}) {
  const [state, action, pending] = useActionState(saveLicenseConfig, {});

  return (
    <form
      action={action}
      className="space-y-3 rounded-lg border border-black/10 p-5 dark:border-white/10"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Cobro de la licencia</h2>
        {paid && (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
            Ya pagada
          </span>
        )}
      </div>
      <p className="text-sm opacity-60">
        Si activas el cobro, esta instalación pedirá el pago (pantalla{" "}
        <code>/licencia</code>) antes de dejar crear el administrador en{" "}
        <code>/setup</code>. Una vez aprobado un comprobante, queda
        desbloqueada para siempre.
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="licenseEnabled" defaultChecked={enabled} />
        <span>
          Pedir pago antes del primer uso
          {paid ? " (esta instalación ya está pagada, no volverá a pedirlo)" : ""}
        </span>
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Precio a mostrar</span>
        <input
          name="licensePriceLabel"
          defaultValue={priceLabel ?? ""}
          placeholder='p. ej. "$49 USD" o "$49 USD / mes"'
          className={field}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Métodos e instrucciones de pago</span>
        <textarea
          name="licensePaymentInstructions"
          defaultValue={instructions ?? ""}
          rows={4}
          placeholder={"Zelle: nombre@correo.com\nBinance (USDT): xxxxxxxx\nPago móvil: 0412-...\n"}
          className={field}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

type Claim = {
  id: string;
  reference: string;
  method: string | null;
  contactInfo: string | null;
  status: string;
  note: string | null;
  createdAt: Date;
};

function RejectButton({ id }: { id: string }) {
  return (
    <details className="inline-block">
      <summary className="cursor-pointer rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-600 dark:text-red-400">
        Rechazar
      </summary>
      <form
        action={rejectLicenseClaim}
        className="mt-2 flex flex-col gap-2 rounded-md border border-black/10 p-2 dark:border-white/10"
      >
        <input type="hidden" name="id" value={id} />
        <input
          name="note"
          placeholder="Motivo (opcional, lo verá el comprador)"
          className="rounded-md border border-black/15 bg-transparent px-2 py-1 text-xs outline-none dark:border-white/20"
        />
        <button
          type="submit"
          className="self-start rounded-md bg-red-600 px-2 py-1 text-xs text-white"
        >
          Confirmar rechazo
        </button>
      </form>
    </details>
  );
}

export function LicenseClaimsList({ claims }: { claims: Claim[] }) {
  const pending = claims.filter((c) => c.status === "pending");
  const resolved = claims.filter((c) => c.status !== "pending").slice(0, 5);

  return (
    <section className="space-y-3 rounded-lg border border-black/10 p-5 dark:border-white/10">
      <h2 className="font-medium">
        Comprobantes de pago{" "}
        {pending.length > 0 && (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">
            {pending.length} pendiente{pending.length > 1 ? "s" : ""}
          </span>
        )}
      </h2>

      {pending.length === 0 ? (
        <p className="text-sm opacity-60">No hay comprobantes pendientes de revisión.</p>
      ) : (
        <ul className="space-y-3">
          {pending.map((c) => (
            <li
              key={c.id}
              className="space-y-1 rounded-md border border-black/10 p-3 text-sm dark:border-white/10"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-mono">{c.reference}</span>
                  {c.method && <span className="ml-2 opacity-60">· {c.method}</span>}
                </div>
                <span className="text-xs opacity-50">
                  {c.createdAt.toLocaleString("es-ES")}
                </span>
              </div>
              {c.contactInfo && (
                <div className="text-xs opacity-70">Contacto: {c.contactInfo}</div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <form action={approveLicenseClaim}>
                  <input type="hidden" name="id" value={c.id} />
                  <button
                    type="submit"
                    className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white"
                  >
                    Aprobar y desbloquear
                  </button>
                </form>
                <RejectButton id={c.id} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {resolved.length > 0 && (
        <div className="pt-2">
          <div className="mb-1 text-xs uppercase tracking-wide opacity-50">
            Últimos revisados
          </div>
          <ul className="space-y-1 text-xs opacity-70">
            {resolved.map((c) => (
              <li key={c.id}>
                <span className="font-mono">{c.reference}</span> —{" "}
                {c.status === "approved" ? "aprobado" : "rechazado"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
