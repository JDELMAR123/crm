import Link from "next/link";
import { redirect } from "next/navigation";
import { hasAnyUser } from "@/lib/auth";
import { ensureCreatorAccount } from "@/lib/creator";
import { getSettings } from "@/lib/settings";
import { login } from "@/lib/actions/auth";
import AuthForm from "../_components/AuthForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  await ensureCreatorAccount();
  const { force } = await searchParams;
  const noRealAdmin = !(await hasAnyUser());

  // Primera visita normal (sin cuenta que usar todavía): en vez de forzar el
  // salto, se deja un enlace — así el creador siempre puede entrar con sus
  // propias credenciales aunque el cliente aún no haya hecho /setup.
  if (noRealAdmin && force !== "1") {
    const locked = (await getSettings()).license.locked;
    redirect(locked ? "/licencia" : "/setup");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Entrar</h1>
        <p className="text-sm opacity-70">Accede a tu CRM.</p>
      </div>
      <AuthForm action={login} submitLabel="Entrar" />
      {noRealAdmin && (
        <p className="text-center text-xs opacity-50">
          ¿Primera vez por aquí?{" "}
          <Link href="/setup" className="underline">
            Configura tu CRM
          </Link>
        </p>
      )}
    </div>
  );
}
