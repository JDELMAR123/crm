import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import DeleteProductButton from "@/components/DeleteProductButton";
import ProductActiveToggle from "@/components/ProductActiveToggle";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const user = await requireUser();
  const isAdmin = user.role === "ADMIN";

  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Productos</h1>
          <p className="text-sm opacity-60">
            Lo que configures aquí es lo que la IA usa para entender qué vende
            tu negocio, sin importar el rubro.
          </p>
        </div>
        {isAdmin && (
          <Link
            href="/productos/new"
            className="rounded-md bg-brand px-3 py-1.5 text-sm text-brand-contrast"
          >
            Nuevo producto
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <div className="rounded-lg border border-dashed border-black/15 p-6 text-sm opacity-70 dark:border-white/20">
          Aún no hay productos configurados.{" "}
          {isAdmin ? (
            <>
              Añade el primero para que la IA pueda reconocerlo en las
              conversaciones.
            </>
          ) : (
            <>Pide a un administrador que los añada en Ajustes.</>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="border-b border-black/10 text-left opacity-70 dark:border-white/10">
              <tr>
                <th className="px-4 py-2 font-medium">Nombre</th>
                <th className="px-4 py-2 font-medium">Categoría</th>
                <th className="px-4 py-2 font-medium">Precio</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                {isAdmin && <th className="px-4 py-2 font-medium">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                  <td className="px-4 py-2">
                    <div className="font-medium">{p.name}</div>
                    {p.description && (
                      <div className="max-w-md truncate text-xs opacity-60">
                        {p.description}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-2 opacity-80">{p.category ?? "—"}</td>
                  <td className="px-4 py-2">
                    {p.price != null ? p.price.toLocaleString("es-ES") : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {isAdmin ? (
                      <ProductActiveToggle id={p.id} active={p.active} />
                    ) : p.active ? (
                      "Activo"
                    ) : (
                      "Inactivo"
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/productos/${p.id}/edit`}
                          className="rounded-md border border-black/15 px-3 py-1.5 text-xs dark:border-white/20"
                        >
                          Editar
                        </Link>
                        <DeleteProductButton id={p.id} />
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
