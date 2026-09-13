"use client";

import { useState } from "react";
import { deleteProduct } from "@/lib/actions/products";

export default function DeleteProductButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-500/40 px-3 py-1.5 text-xs text-red-600 dark:text-red-400"
      >
        Eliminar
      </button>
    );
  }

  return (
    <form action={deleteProduct} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-xs">¿Seguro?</span>
      <button
        type="submit"
        className="rounded-md bg-red-600 px-2 py-1.5 text-xs text-white"
      >
        Sí
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-md border border-black/15 px-2 py-1.5 text-xs dark:border-white/20"
      >
        Cancelar
      </button>
    </form>
  );
}
