"use client";

import { useState, useTransition } from "react";
import { sendReply } from "@/lib/actions/inbox";

export default function ReplyBox({
  conversationId,
  draft,
  channelConnected,
  channelLabel,
}: {
  conversationId: string;
  draft?: string | null;
  channelConnected: boolean;
  channelLabel: string;
}) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!text.trim()) return;
    startTransition(async () => {
      const res = await sendReply(conversationId, text);
      if (res?.error) setError(res.error);
      else {
        setText("");
        setError(null);
      }
    });
  }

  return (
    <div className="space-y-2 border-t border-black/10 p-3 dark:border-white/10">
      {draft && (
        <button
          type="button"
          onClick={() => setText(draft)}
          className="w-full rounded-md bg-blue-500/10 px-3 py-2 text-left text-sm text-blue-800 hover:bg-blue-500/20 dark:text-blue-200"
        >
          <span className="font-medium">Borrador de la IA · </span>
          {draft}
        </button>
      )}
      {error && (
        <p className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {!channelConnected && (
        <p className="text-xs opacity-60">
          {channelLabel} no está conectado: las respuestas se guardan pero no se envían al cliente.
        </p>
      )}
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          rows={2}
          placeholder="Escribe una respuesta… (Ctrl+Enter para enviar)"
          className="w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground dark:border-white/20"
        />
        <button
          onClick={submit}
          disabled={pending || !text.trim()}
          className="shrink-0 rounded-md bg-brand px-4 py-2 text-sm text-brand-contrast disabled:opacity-50"
        >
          {pending ? "…" : "Enviar"}
        </button>
      </div>
    </div>
  );
}
