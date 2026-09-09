import { redirect } from "next/navigation";
import { hasAnyUser } from "@/lib/auth";
import { ensureCreatorAccount } from "@/lib/creator";
import { login } from "@/lib/actions/auth";
import AuthForm from "../_components/AuthForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  await ensureCreatorAccount();
  if (!(await hasAnyUser())) redirect("/setup");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Entrar</h1>
        <p className="text-sm opacity-70">Accede a tu CRM.</p>
      </div>
      <AuthForm action={login} submitLabel="Entrar" />
    </div>
  );
}
