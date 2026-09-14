"use client";

import { useActionState } from "react";
import {
  saveLicenseConfig,
  saveLicenseKey,
  generateLicenseKey,
  setLicenseRevoked,
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
  priceLabel,
  instructions,
}: {
  enabled: boolean;
  priceLabel: string | null;
  instructions: string | null;
}) {
  const [state, action, pending] = useActionState(saveLicenseConfig, {});

  return (
    <form
      action={action}
      className="space-y-3 rounded-lg border border-black/10 p-5 dark:border-white/10"
    >
      <h2 className="font-medium">Cobro de la licencia</h2>
      <p className="text-sm opacity-60">
        Si activas el cobro, esta instalación pedirá el pago (pantalla{" "}
        <code>/licencia</code>) antes de dejar crear el administrador en{" "}
        <code>/setup</code>. Se desbloquea pegando una clave de licencia
        válida (ver abajo) — no con un simple interruptor, para que no
        baste con tocar la base de datos.
      </p>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="licenseEnabled" defaultChecked={enabled} />
        <span>Pedir pago antes del primer uso</span>
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

export function LicenseKeyForm({
  keyLabel,
  valid,
}: {
  keyLabel: string | null;
  valid: boolean;
}) {
  const [state, action, pending] = useActionState(saveLicenseKey, {});

  return (
    <form
      action={action}
      className="space-y-3 rounded-lg border border-black/10 p-5 dark:border-white/10"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-medium">Clave de licencia</h2>
        {valid ? (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-600 dark:text-emerald-400">
            Activa{keyLabel ? ` · ${keyLabel}` : ""}
          </span>
        ) : (
          <span className="rounded-full bg-black/10 px-2 py-0.5 text-xs opacity-60 dark:bg-white/10">
            Sin activar
          </span>
        )}
      </div>
      <p className="text-sm opacity-60">
        Genérala en tu máquina (nunca aquí) con{" "}
        <code>scripts/generate-license-key.ts</code> usando tu clave
        privada, y pégala abajo para desbloquear esta instalación.
      </p>
      <input
        name="licenseKey"
        defaultValue=""
        placeholder="Pega aquí la clave firmada"
        className={`${field} font-mono text-xs`}
      />
      {valid && (
        <label className="flex items-center gap-2 text-xs opacity-70">
          <input type="checkbox" name="licenseKey__clear" />
          Quitar la clave activa (vuelve a bloquear esta instalación)
        </label>
      )}
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar clave"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

/**
 * Genera una clave de licencia con un clic, sin terminal — solo aparece
 * cuando esta instalación tiene configurada tu clave privada de firma.
 */
export function LicenseGeneratorForm({ origin }: { origin: string }) {
  const [state, action, pending] = useActionState(generateLicenseKey, {});

  return (
    <section className="space-y-3 rounded-lg border border-black/10 p-5 dark:border-white/10">
      <h2 className="font-medium">Generar clave de licencia</h2>
      <p className="text-sm opacity-60">
        Escribe una referencia del cliente (su email, por ejemplo) y genera
        su clave aquí mismo. Luego pégala en la sección &quot;Clave de
        licencia&quot; del panel de Creador de su instalación, o mándasela
        para que la pegue él mismo en <code>/licencia</code>.
      </p>
      <p className="rounded-md bg-black/5 p-2 text-xs opacity-70 dark:bg-white/5">
        Para poder bloquearle el acceso más adelante si hiciera falta,
        configúrale en su instalación la variable{" "}
        <code>LICENSE_REGISTRY_URL</code> con el valor{" "}
        <code>{origin}</code> (esta misma instalación). Es opcional — sin
        eso, la clave que le des funciona igual, solo que no la podrás
        revocar a distancia.
      </p>
      <form action={action} className="flex flex-col gap-2 sm:flex-row">
        <input
          name="label"
          placeholder="cliente@ejemplo.com"
          className={field}
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
        >
          {pending ? "Generando…" : "Generar clave"}
        </button>
      </form>
      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
      )}
      {state.key && (
        <div className="space-y-1">
          <span className="text-xs opacity-60">
            Clave generada — selecciónala y cópiala:
          </span>
          <textarea
            readOnly
            rows={3}
            value={state.key}
            onFocus={(e) => e.currentTarget.select()}
            className={`${field} font-mono text-xs`}
          />
        </div>
      )}
    </section>
  );
}

function RevokeToggle({ id, revoked }: { id: string; revoked: boolean }) {
  return (
    <form action={setLicenseRevoked}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="revoked" value={revoked ? "0" : "1"} />
      <button
        type="submit"
        className={
          revoked
            ? "rounded-md bg-emerald-600 px-2 py-1 text-xs text-white"
            : "rounded-md border border-red-500/40 px-2 py-1 text-xs text-red-600 dark:text-red-400"
        }
      >
        {revoked ? "Restaurar acceso" : "Bloquear acceso"}
      </button>
    </form>
  );
}

export function IssuedLicensesList({
  licenses,
}: {
  licenses: { id: string; label: string; revoked: boolean; createdAt: Date }[];
}) {
  if (licenses.length === 0) return null;
  return (
    <section className="space-y-3 rounded-lg border border-black/10 p-5 dark:border-white/10">
      <h2 className="font-medium">Claves generadas</h2>
      <p className="text-sm opacity-60">
        Bloquear corta el acceso de esa cuenta a su CRM en menos de un día —
        solo si esa instalación tiene <code>LICENSE_REGISTRY_URL</code>{" "}
        apuntando aquí (te lo explico si aún no lo has puesto).
      </p>
      <ul className="space-y-2 text-sm">
        {licenses.map((l) => (
          <li
            key={l.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-2 last:border-0 last:pb-0 dark:border-white/10"
          >
            <div className="flex items-center gap-2">
              <span>{l.label}</span>
              {l.revoked && (
                <span className="rounded-full bg-red-500/15 px-2 py-0.5 text-xs text-red-600 dark:text-red-400">
                  Bloqueada
                </span>
              )}
              <span className="text-xs opacity-50">
                {l.createdAt.toLocaleDateString("es-ES")}
              </span>
            </div>
            <RevokeToggle id={l.id} revoked={l.revoked} />
          </li>
        ))}
      </ul>
    </section>
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
      <p className="text-sm opacity-60">
        Al aprobar solo queda como registro. Para desbloquear de verdad,
        genera la clave con el comprobante como referencia y pégala en
        &quot;Clave de licencia&quot; arriba.
      </p>

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
                    Marcar aprobado
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
