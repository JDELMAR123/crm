import { prisma } from "@/lib/prisma";
import { assertModule } from "@/lib/modules";
import ConversationList, {
  type ConversationListItem,
} from "./_components/ConversationList";
import SimulatorForm from "./_components/SimulatorForm";

export const dynamic = "force-dynamic";

export default async function InboxLayout({ children }: LayoutProps<"/inbox">) {
  await assertModule("inbox");
  const conversations = await prisma.conversation.findMany({
    orderBy: { lastMessageAt: "desc" },
    include: { contact: true },
    take: 100,
  });

  const items: ConversationListItem[] = conversations.map((c) => ({
    id: c.id,
    channel: c.channel,
    contactName: `${c.contact.firstName}${c.contact.lastName ? ` ${c.contact.lastName}` : ""}`,
    preview: c.lastMessagePreview,
    unread: c.unread,
    lastMessageAt: c.lastMessageAt.toISOString(),
    stage: c.aiStage,
    interest: c.aiInterest,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Bandeja de entrada</h1>
        <span className="text-sm opacity-60">
          {items.filter((i) => i.unread).length} sin leer
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <div className="space-y-3">
          <SimulatorForm />
          <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
            <ConversationList items={items} />
          </div>
        </div>
        <div className="min-h-[420px] rounded-lg border border-black/10 dark:border-white/10">
          {children}
        </div>
      </div>
    </div>
  );
}
