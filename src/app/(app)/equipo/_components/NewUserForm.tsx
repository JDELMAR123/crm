"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTeamUser } from "@/lib/actions/auth";

const field =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20";

export default function NewUserForm() {
  const [state, action, pending] = useActionState(createTeamUser, {});
  const ref = useRef<HTMLFormElement>(null);
  const ok = !state.error && !pending;

  useEffect(() => {
    if (ok) ref.current?.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return (
    <form
      ref={ref}
      action={action}
      className="space-y-3 rounded-lg border border-black/10 p-4 dark:border-white/10"
    >
      <h2 className="text-sm font-medium">Añadir miembro del equipo</h2>
      {state.error && (
        <p className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <input name="name" placeholder="Nombre" required className={field} />
        <input name="email" type="email" placeholder="Email" required className={field} />
        <input
          name="password"
          type="password"
          placeholder="Contraseña (mín. 8)"
          required
          className={field}
        />
        <select name="role" defaultValue="AGENTE" className={field}>
          <option value="AGENTE">Agente</option>
          <option value="ADMIN">Administrador</option>
        </select>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
      >
        {pending ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
