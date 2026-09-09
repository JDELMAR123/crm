import Link from "next/link";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export default async function ContactsPage({
  searchParams,
}: PageProps<"/contacts">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const where: Prisma.ContactWhereInput = query
    ? {
        OR: [
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { company: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const contacts = await prisma.contact.findMany({
    where,
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Contactos</h1>
        <Link
          href="/contacts/new"
          className="rounded-md bg-brand px-3 py-1.5 text-sm text-brand-contrast"
        >
          Nuevo contacto
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="Buscar por nombre, email o empresa…"
          className="w-full max-w-sm rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20"
        />
        <button
          type="submit"
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20"
        >
          Buscar
        </button>
      </form>

      {contacts.length === 0 ? (
        <p className="opacity-70">
          {query ? "Sin resultados." : "Aún no hay contactos."}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-black/10 text-left opacity-70 dark:border-white/10">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Email</th>
                <th className="px-4 py-2 font-medium">Teléfono</th>
                <th className="px-4 py-2 font-medium">Empresa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="px-4 py-2">
                    <Link
                      href={`/contacts/${c.id}`}
                      className="font-medium hover:underline"
                    >
                      {c.firstName} {c.lastName}
                    </Link>
                  </td>
                  <td className="px-4 py-2 opacity-80">{c.email ?? "—"}</td>
                  <td className="px-4 py-2">{c.phone ?? "—"}</td>
                  <td className="px-4 py-2">{c.company ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
