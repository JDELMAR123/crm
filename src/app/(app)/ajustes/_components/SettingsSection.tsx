"use client";

import { useActionState } from "react";
import type { SettingsState } from "@/lib/actions/settings";

type Props = {
  title: string;
  description?: string;
  action: (state: SettingsState, formData: FormData) => Promise<SettingsState>;
  children: React.ReactNode;
};

export default function SettingsSection({
  title,
  description,
  action,
  children,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-lg border border-black/10 p-5 dark:border-white/10"
    >
      <div>
        <h2 className="font-medium">{title}</h2>
        {description && <p className="text-sm opacity-60">{description}</p>}
      </div>

      {children}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
        >
          {pending ? "Guardando…" : "Guardar"}
        </button>
        {state.ok && <span className="text-sm text-green-600 dark:text-green-400">Guardado ✓</span>}
        {state.error && (
          <span className="text-sm text-red-600 dark:text-red-400">{state.error}</span>
        )}
      </div>
    </form>
  );
}

export const inputClass =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20";

export function SecretField({
  name,
  label,
  isSet,
}: {
  name: string;
  label: string;
  isSet: boolean;
}) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type="password"
        autoComplete="off"
        placeholder={isSet ? "•••••••• (configurado — deja vacío para no cambiar)" : "No configurado"}
        className={inputClass}
      />
      {isSet && (
        <span className="flex items-center gap-1 text-xs opacity-60">
          <input type="checkbox" name={`${name}__clear`} /> Borrar valor guardado
        </span>
      )}
    </label>
  );
}
