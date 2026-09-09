"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { ContactFormState } from "@/lib/actions/contacts";

type ContactValues = {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  notes?: string | null;
};

type Props = {
  action: (
    state: ContactFormState,
    formData: FormData
  ) => Promise<ContactFormState>;
  defaultValues?: ContactValues;
  submitLabel: string;
  cancelHref: string;
};

const field =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20";

export default function ContactForm({
  action,
  defaultValues,
  submitLabel,
  cancelHref,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const fe = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <p className="rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-1 text-sm">
          <span className="font-medium">Nombre *</span>
          <input
            name="firstName"
            defaultValue={defaultValues?.firstName ?? ""}
            required
            className={field}
          />
          {fe.firstName && (
            <span className="block text-xs text-red-600 dark:text-red-400">
              {fe.firstName}
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Apellidos</span>
          <input
            name="lastName"
            defaultValue={defaultValues?.lastName ?? ""}
            className={field}
          />
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={defaultValues?.email ?? ""}
            className={field}
          />
          {fe.email && (
            <span className="block text-xs text-red-600 dark:text-red-400">
              {fe.email}
            </span>
          )}
        </label>

        <label className="space-y-1 text-sm">
          <span className="font-medium">Teléfono</span>
          <input
            name="phone"
            defaultValue={defaultValues?.phone ?? ""}
            className={field}
          />
        </label>

        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium">Empresa</span>
          <input
            name="company"
            defaultValue={defaultValues?.company ?? ""}
            className={field}
          />
        </label>

        <label className="space-y-1 text-sm sm:col-span-2">
          <span className="font-medium">Notas</span>
          <textarea
            name="notes"
            rows={4}
            defaultValue={defaultValues?.notes ?? ""}
            className={field}
          />
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
