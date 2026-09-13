import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import ProductForm from "@/components/ProductForm";
import { createProduct } from "@/lib/actions/products";

export default async function NewProductPage() {
  await requireAdmin();

  return (
    <div className="space-y-6">
      <div className="text-sm opacity-70">
        <Link href="/productos" className="hover:underline">
          Productos
        </Link>{" "}
        / Nuevo
      </div>
      <h1 className="text-2xl font-semibold">Nuevo producto</h1>
      <ProductForm
        action={createProduct}
        submitLabel="Crear producto"
        cancelHref="/productos"
      />
    </div>
  );
}
