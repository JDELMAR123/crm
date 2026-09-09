import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteTeamUser } from "@/lib/actions/auth";
import NewUserForm from "./_components/NewUserForm";

export const dynamic = "force-dynamic";

export default async function EquipoPage() {
  const admin = await requireAdmin();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Equipo</h1>
        <p className="opacity-70">Usuarios con acceso a este CRM.</p>
      </div>

      <NewUserForm />

      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full text-sm">
          <thead className="border-b border-black/10 text-left opacity-70 dark:border-white/10">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Email</th>
              <th className="px-4 py-2 font-medium">Rol</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 font-medium">
                  {u.name}
                  {u.id === admin.id && (
                    <span className="ml-2 text-xs opacity-50">(tú)</span>
                  )}
                </td>
                <td className="px-4 py-2 opacity-80">{u.email}</td>
                <td className="px-4 py-2">
                  {u.role === "ADMIN" ? "Administrador" : "Agente"}
                </td>
                <td className="px-4 py-2 text-right">
                  {u.id !== admin.id && (
                    <form action={deleteTeamUser}>
                      <input type="hidden" name="id" value={u.id} />
                      <button className="text-xs text-red-600 hover:underline dark:text-red-400">
                        Eliminar
                      </button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
