"use client";

import { useTransition } from "react";
import { reanalyzeConversation } from "@/lib/actions/inbox";

export default function ReanalyzeButton({ conversationId }: { conversationId: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      onClick={() => startTransition(() => reanalyzeConversation(conversationId))}
      disabled={pending}
      className="rounded-md border border-black/15 px-2 py-1 text-xs opacity-70 hover:opacity-100 disabled:opacity-40 dark:border-white/20"
    >
      {pending ? "Analizando…" : "Volver a analizar"}
    </button>
  );
}
