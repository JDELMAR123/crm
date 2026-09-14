import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { ensureCreatorAccount, isCreatorEmail } from "@/lib/creator";
import { getSettings } from "@/lib/settings";
import { logout } from "@/lib/actions/auth";
import { BrandMark, BrandStyle } from "@/components/Brand";
import NavLinks, { type NavItem } from "@/components/NavLinks";
import PageTransition from "@/components/PageTransition";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, settings] = await Promise.all([
    requireUser(),
    getSettings(),
    ensureCreatorAccount(),
  ]);
  const off = settings.disabledModules;
  const isCreator = isCreatorEmail(user.email);

  // Si el creador revocó la clave de esta instalación, se corta el acceso a
  // todo el equipo del cliente — salvo al propio creador, que siempre debe
  // poder entrar (a revisar, a restaurar el acceso, a lo que haga falta).
  if (settings.license.locked && !isCreator) redirect("/licencia");

  const navItems: NavItem[] = [
    { href: "/", label: "Inicio" },
    ...(!off.includes("inbox") ? [{ href: "/inbox", label: "Bandeja" }] : []),
    ...(!off.includes("pipeline") ? [{ href: "/pipeline", label: "Pipeline" }] : []),
    { href: "/contacts", label: "Contactos" },
    { href: "/productos", label: "Productos" },
    ...(user.role === "ADMIN"
      ? [
          { href: "/equipo", label: "Equipo" },
          { href: "/ajustes", label: "Ajustes" },
        ]
      : []),
    ...(isCreator ? [{ href: "/creador", label: "Creador", special: true }] : []),
  ];

  return (
    <>
      <BrandStyle branding={settings.branding} />
      {settings.creatorNotice && (
        <div className="bg-amber-500/15 px-6 py-2 text-center text-sm text-amber-800 dark:text-amber-200">
          {settings.creatorNotice}
        </div>
      )}
      <header className="border-b border-black/10 dark:border-white/10">
        <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
          <Link href="/" className="flex items-center">
            <BrandMark businessName={settings.businessName} branding={settings.branding} />
          </Link>
          <NavLinks items={navItems} />
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="opacity-60">{user.name}</span>
            <form action={logout}>
              <button className="opacity-60 hover:opacity-100">Salir</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
        <PageTransition>{children}</PageTransition>
      </main>
    </>
  );
}
