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

function Status({ state }: { state: CreatorState }) {
  if (state.ok) return <span className="hk-status-msg ok">guardado [ok]</span>;
  if (state.error) return <span className="hk-status-msg error">error: {state.error}</span>;
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
    <form action={action} className="hk-section">
      <h2 className="hk-section-title">Cobro de la licencia</h2>
      <p className="hk-section-hint">
        Si activas el cobro, esta instalación pedirá el pago (pantalla{" "}
        <code>/licencia</code>) antes de dejar crear el administrador en{" "}
        <code>/setup</code>. Se desbloquea pegando una clave de licencia
        válida — no con un simple interruptor, para que no baste con tocar
        la base de datos.
      </p>

      <label className="hk-check-row">
        <input type="checkbox" name="licenseEnabled" defaultChecked={enabled} />
        <span>Pedir pago antes del primer uso</span>
      </label>

      <div className="hk-field" style={{ marginTop: 14 }}>
        <span className="hk-label">Precio a mostrar</span>
        <input
          name="licensePriceLabel"
          defaultValue={priceLabel ?? ""}
          placeholder='p. ej. "$49 USD" o "$49 USD / mes"'
          className="hk-input"
        />
      </div>

      <div className="hk-field">
        <span className="hk-label">Métodos e instrucciones de pago</span>
        <textarea
          name="licensePaymentInstructions"
          defaultValue={instructions ?? ""}
          rows={4}
          placeholder={"Zelle: nombre@correo.com\nBinance (USDT): xxxxxxxx\nPago móvil: 0412-...\n"}
          className="hk-textarea"
        />
      </div>

      <div className="flex items-center gap-3">
        <button disabled={pending} className="hk-btn">
          {pending ? "guardando…" : "guardar"}
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
    <form action={action} className="hk-section">
      <div className="flex items-center justify-between">
        <h2 className="hk-section-title" style={{ marginBottom: 0 }}>Clave de licencia</h2>
        <span className={`hk-badge ${valid ? "ok" : "neutral"}`}>
          {valid ? `activa${keyLabel ? ` · ${keyLabel}` : ""}` : "sin activar"}
        </span>
      </div>
      <p className="hk-section-hint" style={{ marginTop: 8 }}>
        Genérala en tu máquina (nunca aquí) con{" "}
        <code>scripts/generate-license-key.ts</code> usando tu clave
        privada, y pégala abajo para desbloquear esta instalación.
      </p>
      <div className="hk-field">
        <input
          name="licenseKey"
          defaultValue=""
          placeholder="Pega aquí la clave firmada"
          className="hk-input hk-mono"
          style={{ fontSize: 12 }}
        />
      </div>
      {valid && (
        <label className="hk-check-row" style={{ fontSize: 12 }}>
          <input type="checkbox" name="licenseKey__clear" />
          <span>Quitar la clave activa (vuelve a bloquear esta instalación)</span>
        </label>
      )}
      <div className="flex items-center gap-3" style={{ marginTop: 4 }}>
        <button disabled={pending} className="hk-btn">
          {pending ? "guardando…" : "guardar clave"}
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
    <section className="hk-section">
      <h2 className="hk-section-title">Generar clave de licencia</h2>
      <p className="hk-section-hint">
        Escribe una referencia del cliente (su email, por ejemplo) y genera
        su clave aquí mismo. Luego pégala en la sección &quot;Clave de
        licencia&quot; del panel de Creador de su instalación, o mándasela
        para que la pegue él mismo en <code>/licencia</code>.
      </p>
      <p className="hk-section-hint" style={{ background: "var(--hk-bg-inset)", border: "1px solid var(--hk-border)", borderRadius: 3, padding: "8px 10px" }}>
        Para poder bloquearle el acceso más adelante si hiciera falta,
        configúrale en su instalación la variable{" "}
        <code>LICENSE_REGISTRY_URL</code> con el valor{" "}
        <code>{origin}</code> (esta misma instalación). Es opcional — sin
        eso, la clave que le des funciona igual, solo que no la podrás
        revocar a distancia.
      </p>
      <form action={action} className="flex flex-col gap-2 sm:flex-row" style={{ marginTop: 12 }}>
        <input
          name="label"
          placeholder="cliente@ejemplo.com"
          className="hk-input"
        />
        <button type="submit" disabled={pending} className="hk-btn shrink-0">
          {pending ? "generando…" : "generar clave"}
        </button>
      </form>
      {state.error && <p className="hk-status-msg error" style={{ marginTop: 8 }}>error: {state.error}</p>}
      {state.key && (
        <div className="hk-field" style={{ marginTop: 10 }}>
          <span className="hk-label">Clave generada — selecciónala y cópiala</span>
          <textarea
            readOnly
            rows={3}
            value={state.key}
            onFocus={(e) => e.currentTarget.select()}
            className="hk-textarea hk-mono"
            style={{ fontSize: 11 }}
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
      <button type="submit" className={`hk-btn small${revoked ? "" : " danger"}`}>
        {revoked ? "restaurar acceso" : "bloquear acceso"}
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
    <section className="hk-section">
      <h2 className="hk-section-title">Claves generadas</h2>
      <p className="hk-section-hint">
        Bloquear corta el acceso de esa cuenta a su CRM en menos de un día —
        solo si esa instalación tiene <code>LICENSE_REGISTRY_URL</code>{" "}
        apuntando aquí.
      </p>
      <ul className="hk-list">
        {licenses.map((l) => (
          <li key={l.id} className="hk-list-item">
            <div className="hk-list-item-top">
              <span>
                {l.label}{" "}
                {l.revoked && <span className="hk-badge danger" style={{ marginLeft: 6 }}>bloqueada</span>}
              </span>
              <span className="hk-footnote" style={{ margin: 0 }}>
                {l.createdAt.toLocaleDateString("es-ES")}
              </span>
            </div>
            <div className="hk-list-item-actions">
              <RevokeToggle id={l.id} revoked={l.revoked} />
            </div>
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
    <details style={{ display: "inline-block" }}>
      <summary className="hk-btn small danger" style={{ display: "inline-flex", cursor: "pointer" }}>
        rechazar
      </summary>
      <form
        action={rejectLicenseClaim}
        className="hk-field"
        style={{ marginTop: 8, border: "1px solid var(--hk-border)", borderRadius: 3, padding: 8 }}
      >
        <input type="hidden" name="id" value={id} />
        <input
          name="note"
          placeholder="Motivo (opcional, lo verá el comprador)"
          className="hk-input"
          style={{ fontSize: 12, marginBottom: 8 }}
        />
        <button type="submit" className="hk-btn small danger">
          confirmar rechazo
        </button>
      </form>
    </details>
  );
}

export function LicenseClaimsList({ claims }: { claims: Claim[] }) {
  const pending = claims.filter((c) => c.status === "pending");
  const resolved = claims.filter((c) => c.status !== "pending").slice(0, 5);

  return (
    <section className="hk-section">
      <h2 className="hk-section-title">
        Comprobantes de pago{" "}
        {pending.length > 0 && (
          <span className="hk-badge warn" style={{ marginLeft: 8, textTransform: "none", letterSpacing: 0 }}>
            {pending.length} pendiente{pending.length > 1 ? "s" : ""}
          </span>
        )}
      </h2>
      <p className="hk-section-hint">
        Al aprobar solo queda como registro. Para desbloquear de verdad,
        genera la clave con el comprobante como referencia y pégala en
        &quot;Clave de licencia&quot; arriba.
      </p>

      {pending.length === 0 ? (
        <p className="hk-empty">No hay comprobantes pendientes de revisión.</p>
      ) : (
        <ul className="hk-list">
          {pending.map((c) => (
            <li key={c.id} className="hk-list-item">
              <div className="hk-list-item-top">
                <div>
                  <span className="hk-mono">{c.reference}</span>
                  {c.method && <span className="hk-footnote" style={{ marginLeft: 8 }}>· {c.method}</span>}
                </div>
                <span className="hk-footnote" style={{ margin: 0 }}>
                  {c.createdAt.toLocaleString("es-ES")}
                </span>
              </div>
              {c.contactInfo && (
                <div className="hk-footnote" style={{ marginTop: 4 }}>Contacto: {c.contactInfo}</div>
              )}
              <div className="hk-list-item-actions">
                <form action={approveLicenseClaim}>
                  <input type="hidden" name="id" value={c.id} />
                  <button type="submit" className="hk-btn small">
                    marcar aprobado
                  </button>
                </form>
                <RejectButton id={c.id} />
              </div>
            </li>
          ))}
        </ul>
      )}

      {resolved.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="hk-label">Últimos revisados</div>
          <ul className="hk-list" style={{ gap: 4 }}>
            {resolved.map((c) => (
              <li key={c.id} className="hk-footnote" style={{ margin: 0 }}>
                <span className="hk-mono">{c.reference}</span> —{" "}
                {c.status === "approved" ? "aprobado" : "rechazado"}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
