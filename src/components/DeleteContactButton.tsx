"use client";

import { useState } from "react";
import { deleteContact } from "@/lib/actions/contacts";

export default function DeleteContactButton({ id }: { id: string }) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-500/40 px-4 py-2 text-sm text-red-600 dark:text-red-400"
      >
        Eliminar
      </button>
    );
  }

  return (
    <form action={deleteContact} className="flex items-center gap-2">
      <input type="hidden" name="id" value={id} />
      <span className="text-sm">¿Seguro?</span>
      <button
        type="submit"
        className="rounded-md bg-red-600 px-3 py-2 text-sm text-white"
      >
        Sí, eliminar
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/20"
      >
        Cancelar
      </button>
    </form>
  );
}
