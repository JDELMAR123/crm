"use client";

import { useActionState } from "react";
import { saveModules, saveNotice, type CreatorState } from "@/lib/actions/creator";

const MODULES: { id: "inbox" | "pipeline" | "ia"; label: string; desc: string }[] = [
  { id: "inbox", label: "Bandeja de entrada", desc: "Conversaciones de WhatsApp e Instagram" },
  { id: "pipeline", label: "Pipeline", desc: "Tablero Kanban de clientes por etapa" },
  { id: "ia", label: "Sectorización con IA", desc: "Análisis automático de cada conversación" },
];

function Status({ state }: { state: CreatorState }) {
  if (state.ok) return <span className="text-sm text-green-600 dark:text-green-400">Guardado ✓</span>;
  if (state.error) return <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>;
  return null;
}

export function ModulesForm({ disabled }: { disabled: string[] }) {
  const [state, action, pending] = useActionState(saveModules, {});
  return (
    <form
      action={action}
      className="space-y-3 rounded-lg border border-black/10 p-5 dark:border-white/10"
    >
      <h2 className="font-medium">Módulos activos</h2>
      <p className="text-sm opacity-60">
        Desactiva un módulo para ocultarlo en esta instalación.
      </p>
      {MODULES.map((m) => (
        <label key={m.id} className="flex gap-3 text-sm">
          <input
            type="checkbox"
            name={`mod_${m.id}`}
            defaultChecked={!disabled.includes(m.id)}
            className="mt-0.5"
          />
          <span>
            <span className="font-medium">{m.label}</span>
            <span className="block opacity-60">{m.desc}</span>
          </span>
        </label>
      ))}
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function NoticeForm({ notice }: { notice: string | null }) {
  const [state, action, pending] = useActionState(saveNotice, {});
  return (
    <form
      action={action}
      className="space-y-3 rounded-lg border border-black/10 p-5 dark:border-white/10"
    >
      <h2 className="font-medium">Aviso a los usuarios</h2>
      <p className="text-sm opacity-60">
        Aparece como banner dentro del CRM para todo el equipo. Vacío = sin aviso.
      </p>
      <textarea
        name="creatorNotice"
        defaultValue={notice ?? ""}
        rows={3}
        placeholder="Ej.: Mantenimiento programado el domingo a las 22:00."
        className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20"
      />
      <div className="flex items-center gap-3">
        <button
          disabled={pending}
          className="rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}
