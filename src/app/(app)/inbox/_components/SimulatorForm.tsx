"use client";

import { useRef, useState, useTransition } from "react";
import { simulateInbound } from "@/lib/actions/inbox";

const EXAMPLES = [
  "Hola, ¿tenéis la camiseta azul en talla M?",
  "¿Cuánto cuesta y cuánto tarda el envío a Madrid?",
  "Perfecto, me lo llevo. ¿Cómo pago?",
  "Me parece un poco caro, me lo pienso.",
];

export default function SimulatorForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full rounded-md border border-dashed border-black/20 px-3 py-2 text-sm opacity-70 hover:opacity-100 dark:border-white/20"
      >
        + Simular mensaje entrante
      </button>
    );
  }

  return (
    <form
      ref={formRef}
      action={(fd) => startTransition(async () => {
        await simulateInbound(fd);
        formRef.current?.reset();
      })}
      className="space-y-2 rounded-md border border-black/15 p-3 dark:border-white/20"
    >
      <div className="flex gap-2">
        <input
          name="name"
          placeholder="Nombre del cliente"
          defaultValue="Cliente demo"
          className="w-full rounded border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/20"
        />
        <select
          name="channel"
          defaultValue="WHATSAPP"
          className="rounded border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/20"
        >
          <option value="WHATSAPP">WhatsApp</option>
          <option value="INSTAGRAM">Instagram</option>
          <option value="SIMULADOR">Simulador</option>
        </select>
      </div>
      <textarea
        name="text"
        rows={2}
        placeholder="Mensaje del cliente…"
        className="w-full rounded border border-black/15 bg-transparent px-2 py-1 text-sm dark:border-white/20"
      />
      <div className="flex flex-wrap gap-1">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={(e) => {
              const ta = e.currentTarget.closest("form")?.querySelector("textarea");
              if (ta) (ta as HTMLTextAreaElement).value = ex;
            }}
            className="rounded bg-black/5 px-2 py-0.5 text-xs opacity-70 hover:opacity-100 dark:bg-white/10"
          >
            {ex.slice(0, 32)}…
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-brand px-3 py-1.5 text-sm text-brand-contrast disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Simular"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-black/15 px-3 py-1.5 text-sm dark:border-white/20"
        >
          Cerrar
        </button>
      </div>
    </form>
  );
}
