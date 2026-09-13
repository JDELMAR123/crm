"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ProductState } from "@/lib/actions/products";

type ProductValues = {
  name?: string | null;
  category?: string | null;
  description?: string | null;
  price?: number | null;
  sku?: string | null;
  keywords?: string[];
  active?: boolean;
};

type Props = {
  action: (state: ProductState, formData: FormData) => Promise<ProductState>;
  defaultValues?: ProductValues;
  submitLabel: string;
  cancelHref: string;
};

const field =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20";

export default function ProductForm({
  action,
  defaultValues,
  submitLabel,
  cancelHref,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium">Nombre *</span>
          <input
            name="name"
            defaultValue={defaultValues?.name ?? ""}
            required
            className={field}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Categoría</span>
          <input
            name="category"
            defaultValue={defaultValues?.category ?? ""}
            placeholder="p. ej. Ropa, Consultoría, Repuestos…"
            className={field}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Precio</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={defaultValues?.price ?? ""}
            className={field}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">SKU / referencia</span>
          <input
            name="sku"
            defaultValue={defaultValues?.sku ?? ""}
            className={field}
          />
        </label>

        <label className="flex items-center gap-2 self-end pb-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaultValues?.active ?? true}
            className="h-4 w-4"
          />
          <span>Producto activo (visible para la IA)</span>
        </label>

        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium">Descripción</span>
          <textarea
            name="description"
            rows={3}
            defaultValue={defaultValues?.description ?? ""}
            className={field}
          />
        </label>

        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium">Palabras clave / sinónimos</span>
          <input
            name="keywords"
            defaultValue={(defaultValues?.keywords ?? []).join(", ")}
            placeholder="separadas por comas, p. ej. camiseta, playera, remera"
            className={field}
          />
          <span className="block text-xs opacity-60">
            Así reconoce la IA básica este producto cuando el cliente lo
            nombra de otra forma. Si lo dejas vacío, se usa el nombre.
          </span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
        >
          {pending ? "Guardando…" : submitLabel}
        </button>
        <Link
          href={cancelHref}
          className="rounded-md border border-black/15 px-4 py-2 text-sm dark:border-white/20"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
