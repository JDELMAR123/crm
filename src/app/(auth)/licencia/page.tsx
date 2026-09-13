import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAnyUser } from "@/lib/auth";
import { ensureCreatorAccount } from "@/lib/creator";
import { getSettings } from "@/lib/settings";
import { getMyLicenseClaim, retryLicenseClaim } from "@/lib/actions/license";
import LicenseClaimForm from "./_components/LicenseClaimForm";

export const dynamic = "force-dynamic";

export default async function LicenciaPage() {
  await ensureCreatorAccount();
  if (await hasAnyUser()) redirect("/login");

  const settings = await getSettings();
  if (!settings.license.locked) redirect("/setup");

  const claim = await getMyLicenseClaim();

  if (claim && claim.status !== "rejected") {
    return (
      <div className="space-y-4 text-center">
        <h1 className="text-xl font-semibold">Pago en revisión</h1>
        <p className="text-sm opacity-70">
          Recibimos tu comprobante (<span className="font-mono">{claim.reference}</span>
          ). En cuanto lo confirmemos, esta página te dejará continuar automáticamente.
        </p>
        <Link
          href="/licencia"
          className="inline-block rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/20"
        >
          Actualizar estado
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Activa tu CRM</h1>
        <p className="text-sm opacity-70">
          Este es un paso único. Realiza el pago con alguno de los métodos de
          abajo y envíanos el comprobante para desbloquear tu instalación.
        </p>
      </div>

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

      {(!claim || claim.status === "rejected") && <LicenseClaimForm />}

      <p className="text-center text-xs opacity-50">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login?force=1" className="underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
