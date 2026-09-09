"use client";

import { useActionState } from "react";
import type { AuthState } from "@/lib/actions/auth";

const field =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20";

type Props = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  submitLabel: string;
  withName?: boolean;
  passwordHint?: string;
};

export default function AuthForm({
  action,
  submitLabel,
  withName,
  passwordHint,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      {withName && (
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Nombre</span>
          <input name="name" autoComplete="name" required className={field} />
        </label>
      )}

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Email</span>
        <input
          name="email"
          type="email"
          autoComplete={withName ? "email" : "username"}
          required
          className={field}
        />
      </label>

      <label className="block space-y-1 text-sm">
        <span className="font-medium">Contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete={withName ? "new-password" : "current-password"}
          required
          className={field}
        />
        {passwordHint && (
          <span className="block text-xs opacity-60">{passwordHint}</span>
        )}
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-foreground px-4 py-2 text-sm text-background disabled:opacity-50"
      >
        {pending ? "…" : submitLabel}
      </button>
    </form>
  );
}
