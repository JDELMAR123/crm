"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CHANNEL_LABEL } from "@/lib/channels/labels";
import type { ChannelType, LeadStage } from "@/generated/prisma/client";
import { StageBadge } from "@/components/StageBadge";

export type ConversationListItem = {
  id: string;
  channel: ChannelType;
  contactName: string;
  preview: string | null;
  unread: boolean;
  lastMessageAt: string;
  stage: LeadStage | null;
  interest: number | null;
};

export default function ConversationList({ items }: { items: ConversationListItem[] }) {
  const pathname = usePathname();

  return (
    <ul className="divide-y divide-black/10 dark:divide-white/10">
      {items.length === 0 && (
        <li className="px-3 py-6 text-center text-sm opacity-60">
          No hay conversaciones todavía.
        </li>
      )}
      {items.map((c) => {
        const active = pathname === `/inbox/${c.id}`;
        return (
          <li key={c.id}>
            <Link
              href={`/inbox/${c.id}`}
              className={`block px-3 py-3 ${
                active ? "bg-black/5 dark:bg-white/10" : "hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 truncate font-medium">
                  {c.unread && <span className="h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                  {c.contactName}
                </span>
                <span className="shrink-0 text-[10px] uppercase opacity-50">
                  {CHANNEL_LABEL[c.channel]}
                </span>
              </div>
              <p className="mt-0.5 truncate text-sm opacity-70">{c.preview ?? "—"}</p>
              {c.stage && (
                <div className="mt-1 flex items-center gap-2">
                  <StageBadge stage={c.stage} />
                  {c.interest != null && (
                    <span className="text-[10px] opacity-50">interés {c.interest}</span>
                  )}
                </div>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
