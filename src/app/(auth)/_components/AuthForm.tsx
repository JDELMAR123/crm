"use client";

import { useState } from "react";
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

function EyeIcon({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1c.45-.07.9-.1 1.4-.1 7 0 10.5 7 10.5 7a15.6 15.6 0 0 1-3.3 4.1M6.6 6.6C3.4 8.6 1.5 12 1.5 12s3.5 7 10.5 7c1.6 0 3-.35 4.2-.9" />
        <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

/** Campo de contraseña con botón de ojo para mostrar/ocultar el texto. */
function PasswordField({
  autoComplete,
  hint,
}: {
  autoComplete: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium">Contraseña</span>
      <span className="relative block">
        <input
          name="password"
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className={`${field} pr-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
          className="absolute inset-y-0 right-0 flex items-center px-3 opacity-60 hover:opacity-100 focus-visible:opacity-100"
        >
          <EyeIcon open={visible} />
        </button>
      </span>
      {hint && <span className="block text-xs opacity-60">{hint}</span>}
    </label>
  );
}

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

      <PasswordField
        autoComplete={withName ? "new-password" : "current-password"}
        hint={passwordHint}
      />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
      >
        {pending ? "…" : submitLabel}
      </button>
    </form>
  );
}
