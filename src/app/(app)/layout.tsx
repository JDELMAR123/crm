import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { ensureCreatorAccount, isCreatorEmail } from "@/lib/creator";
import { getSettings } from "@/lib/settings";
import { logout } from "@/lib/actions/auth";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  await ensureCreatorAccount();
  const [user, settings] = await Promise.all([requireUser(), getSettings()]);
  const off = settings.disabledModules;
  const isCreator = isCreatorEmail(user.email);

  return (
    <>
      {settings.creatorNotice && (
        <div className="bg-amber-500/15 px-6 py-2 text-center text-sm text-amber-800 dark:text-amber-200">
          {settings.creatorNotice}
        </div>
      )}
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <Link href="/" className="text-lg font-semibold">
            {settings.businessName}
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/" className="opacity-70 hover:opacity-100">
              Inicio
            </Link>
            {!off.includes("inbox") && (
              <Link href="/inbox" className="opacity-70 hover:opacity-100">
                Bandeja
              </Link>
            )}
            {!off.includes("pipeline") && (
              <Link href="/pipeline" className="opacity-70 hover:opacity-100">
                Pipeline
              </Link>
            )}
            <Link href="/contacts" className="opacity-70 hover:opacity-100">
              Contactos
            </Link>
            {user.role === "ADMIN" && (
              <>
                <Link href="/equipo" className="opacity-70 hover:opacity-100">
                  Equipo
                </Link>
                <Link href="/ajustes" className="opacity-70 hover:opacity-100">
                  Ajustes
                </Link>
              </>
            )}
            {isCreator && (
              <Link href="/creador" className="font-medium text-blue-600 dark:text-blue-400">
                Creador
              </Link>
            )}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="opacity-60">{user.name}</span>
            <form action={logout}>
              <button className="opacity-60 hover:opacity-100">Salir</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </>
  );
}
