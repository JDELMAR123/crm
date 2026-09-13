"use client";

import { useTransition } from "react";
import { toggleProductActive } from "@/lib/actions/products";

export default function ProductActiveToggle({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => startTransition(() => toggleProductActive(formData))}
    >
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="active" value={active ? "0" : "1"} />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-full px-2 py-0.5 text-xs disabled:opacity-50 ${
          active
            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
            : "bg-black/10 text-black/50 dark:bg-white/10 dark:text-white/50"
        }`}
      >
        {active ? "Activo" : "Inactivo"}
      </button>
    </form>
  );
}
