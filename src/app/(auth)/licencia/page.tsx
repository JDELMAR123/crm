import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAnyUser } from "@/lib/auth";
import { ensureCreatorAccount } from "@/lib/creator";
import { getSettings } from "@/lib/settings";
import { getMyLicenseClaim, retryLicenseClaim } from "@/lib/actions/license";
import LicenseClaimForm from "./_components/LicenseClaimForm";
import LicenseKeyForm from "./_components/LicenseKeyForm";

export const dynamic = "force-dynamic";

export default async function LicenciaPage() {
  await ensureCreatorAccount();

  const settings = await getSettings();
  if (!settings.license.locked) {
    // Nada que hacer aquí: manda a donde corresponda según si ya hay
    // administrador real o todavía no.
    redirect((await hasAnyUser()) ? "/login" : "/setup");
  }

  const claim = await getMyLicenseClaim();
  const claimPending = claim && claim.status === "pending";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">
          {settings.license.revoked ? "Acceso suspendido" : "Activa tu CRM"}
        </h1>
        <p className="text-sm opacity-70">
          {settings.license.revoked
            ? "El acceso a este CRM fue suspendido. Contacta a quien te lo vendió para reactivarlo, o pega abajo una clave de licencia nueva si ya te la dieron."
            : "Este es un paso único. Realiza el pago con alguno de los métodos de abajo y te daremos una clave de licencia para desbloquear tu instalación."}
        </p>
      </div>

      <div className="space-y-2 rounded-lg border border-black/10 p-4 dark:border-white/10">
        <div className="font-medium">¿Ya tienes tu clave de licencia?</div>
        <LicenseKeyForm />
      </div>

      {settings.license.priceLabel && (
        <div className="rounded-lg border border-black/10 p-4 text-center dark:border-white/10">
          <div className="text-xs uppercase tracking-wide opacity-60">Precio</div>
          <div className="text-2xl font-semibold">{settings.license.priceLabel}</div>
        </div>
      )}

      {settings.license.instructions && (
        <div className="space-y-1 rounded-lg border border-black/10 p-4 text-sm dark:border-white/10">
          <div className="font-medium">Métodos de pago</div>
          <p className="whitespace-pre-wrap opacity-80">
            {settings.license.instructions}
          </p>
        </div>
      )}

      <div className="space-y-3 border-t border-black/10 pt-6 dark:border-white/10">
        <p className="text-sm opacity-70">
          Ya pagaste pero todavía no tienes la clave? Mándanos el comprobante
          y te la generamos.
        </p>

        {claimPending ? (
          <div className="space-y-2 text-sm">
            <p className="opacity-70">
              Recibimos tu comprobante (
              <span className="font-mono">{claim.reference}</span>). Te
              enviaremos la clave de licencia en cuanto lo confirmemos.
            </p>
            <Link href="/licencia" className="underline">
              Actualizar
            </Link>
          </div>
        ) : (
          <>
            {claim?.status === "rejected" && (
              <div className="space-y-2 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
                <p>No pudimos validar tu comprobante anterior.</p>
                {claim.note && <p className="opacity-90">{claim.note}</p>}
                <form action={retryLicenseClaim}>
                  <button type="submit" className="underline">
                    Enviar otro comprobante
                  </button>
                </form>
              </div>
            )}
            <LicenseClaimForm />
          </>
        )}
      </div>

      <p className="text-center text-xs opacity-50">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login?force=1" className="underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
