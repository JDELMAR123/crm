import { redirect } from "next/navigation";
import { hasAnyUser } from "@/lib/auth";
import { ensureCreatorAccount } from "@/lib/creator";
import { setupAdmin } from "@/lib/actions/auth";
import AuthForm from "../_components/AuthForm";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  await ensureCreatorAccount();
  if (await hasAnyUser()) redirect("/login");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Configura tu CRM</h1>
        <p className="text-sm opacity-70">
          Crea la cuenta de administrador. Serás quien gestione el equipo y los ajustes.
        </p>
      </div>
      <AuthForm
        action={setupAdmin}
        submitLabel="Crear administrador"
        withName
        passwordHint="Mínimo 8 caracteres."
      />
    </div>
  );
}
