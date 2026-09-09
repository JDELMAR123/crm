import type { LeadStage } from "@/generated/prisma/client";
import { STAGE_LABEL } from "@/lib/ai/schema";

const STYLES: Record<LeadStage, string> = {
  NUEVO: "bg-black/10 text-foreground dark:bg-white/15",
  INTERESADO: "bg-blue-500/15 text-blue-700 dark:text-blue-300",
  EN_PROCESO_DE_COMPRA: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  CLIENTE: "bg-green-500/15 text-green-700 dark:text-green-300",
  PERDIDO: "bg-red-500/15 text-red-700 dark:text-red-300",
};

export function StageBadge({ stage }: { stage: LeadStage }) {
  return (
    <span
      className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[stage]}`}
    >
      {STAGE_LABEL[stage]}
    </span>
  );
}

export function InterestBar({ score }: { score?: number | null }) {
  const v = Math.max(0, Math.min(100, score ?? 0));
  return (
    <span className="inline-flex items-center gap-2 text-xs opacity-70">
      <span className="h-1.5 w-16 overflow-hidden rounded-full bg-black/10 dark:bg-white/15">
        <span
          className="block h-full rounded-full bg-brand"
          style={{ width: `${v}%` }}
        />
      </span>
      {v}
    </span>
  );
}
