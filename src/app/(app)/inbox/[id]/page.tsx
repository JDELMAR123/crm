import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdapter, getChannelConfig, CHANNEL_LABEL } from "@/lib/channels";
import { getSettings } from "@/lib/settings";
import { StageBadge, InterestBar } from "@/components/StageBadge";
import ReplyBox from "../_components/ReplyBox";
import ReanalyzeButton from "../_components/ReanalyzeButton";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: PageProps<"/inbox/[id]">) {
  const { id } = await params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      contact: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) notFound();

  if (conversation.unread) {
    await prisma.conversation.update({ where: { id }, data: { unread: false } });
  }

  const adapter = getAdapter(conversation.channel);
  const [channelCfg, settings] = await Promise.all([
    getChannelConfig(),
    getSettings(),
  ]);
  const channelConnected =
    conversation.channel === "SIMULADOR" || adapter.isConfigured(channelCfg);
  const signals = safeParse(conversation.aiSignals);

  return (
    <div className="flex h-full flex-col">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-3 border-b border-black/10 p-4 dark:border-white/10">
        <div>
          <Link
            href={`/contacts/${conversation.contactId}`}
            className="font-semibold hover:underline"
          >
            {conversation.contact.firstName} {conversation.contact.lastName}
          </Link>
          <p className="text-xs opacity-60">
            {CHANNEL_LABEL[conversation.channel]}
            {conversation.contact.phone ? ` · ${conversation.contact.phone}` : ""}
          </p>
        </div>
        {conversation.aiStage && <StageBadge stage={conversation.aiStage} />}
      </div>

      <div className="grid flex-1 md:grid-cols-[1fr_260px]">
        {/* Hilo */}
        <div className="flex flex-col">
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {conversation.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  m.direction === "ENTRANTE"
                    ? "bg-black/5 dark:bg-white/10"
                    : "ml-auto bg-foreground text-background"
                }`}
              >
                {m.body}
                <div className="mt-1 text-[10px] opacity-50">
                  {m.createdAt.toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            ))}
          </div>
          <ReplyBox
            key={conversation.id}
            conversationId={conversation.id}
            draft={conversation.aiDraftReply}
            channelConnected={channelConnected}
            channelLabel={CHANNEL_LABEL[conversation.channel]}
          />
        </div>

        {/* Panel de IA */}
        <aside className="space-y-3 border-t border-black/10 p-4 text-sm md:border-l md:border-t-0 dark:border-white/10">
          <div className="flex items-center justify-between">
            <span className="font-medium">Análisis IA</span>
            <ReanalyzeButton conversationId={conversation.id} />
          </div>

          {!conversation.aiAnalyzedAt ? (
            <p className="opacity-60">Sin analizar todavía.</p>
          ) : (
            <>
              <Field label="Interés">
                <InterestBar score={conversation.aiInterest} />
              </Field>
              <Field label="Quiere">{conversation.aiDesired || "—"}</Field>
              <Field label="Sentimiento">{conversation.aiSentiment || "—"}</Field>
              {signals?.budget && <Field label="Presupuesto">{signals.budget}</Field>}
              {signals?.urgency && <Field label="Urgencia">{signals.urgency}</Field>}
              {signals?.objections && (
                <Field label="Objeciones">{signals.objections}</Field>
              )}
              <Field label="Resumen">{conversation.aiSummary || "—"}</Field>
              <Field label="Siguiente paso">{conversation.aiNextStep || "—"}</Field>
            </>
          )}

          <p className="pt-2 text-[10px] opacity-40">
            Motor: IA {settings.ai.provider === "anthropic" ? "avanzada" : "básica"}
          </p>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide opacity-50">{label}</div>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}

function safeParse(s: string | null): Record<string, string> | null {
  if (!s) return null;
  try {
    return JSON.parse(s) as Record<string, string>;
  } catch {
    return null;
  }
}
