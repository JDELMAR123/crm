import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import ProductForm from "@/components/ProductForm";
import { updateProduct } from "@/lib/actions/products";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: PageProps<"/productos/[id]/edit">) {
  await requireAdmin();
  const { id } = await params;
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) notFound();

  const action = updateProduct.bind(null, product.id);
  const keywords: string[] = (() => {
    try {
      const v = JSON.parse(product.keywords);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="space-y-6">
      <div className="text-sm opacity-70">
        <Link href="/productos" className="hover:underline">
          Productos
        </Link>{" "}
        / {product.name} / Editar
      </div>
      <h1 className="text-2xl font-semibold">Editar producto</h1>
      <ProductForm
        action={action}
        defaultValues={{ ...product, keywords }}
        submitLabel="Guardar cambios"
        cancelHref="/productos"
      />
    </div>
  );
}
