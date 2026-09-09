import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { assertModule } from "@/lib/modules";
import { LEAD_STAGES, STAGE_LABEL } from "@/lib/ai/schema";
import { InterestBar } from "@/components/StageBadge";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  await assertModule("pipeline");
  const contacts = await prisma.contact.findMany({
    orderBy: [{ interestScore: "desc" }, { updatedAt: "desc" }],
  });

  const byStage = Object.fromEntries(
    LEAD_STAGES.map((s) => [s, contacts.filter((c) => c.stage === s)])
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Pipeline</h1>
        <p className="opacity-70">
          Los contactos se colocan solos según el análisis de la IA sobre sus conversaciones.
        </p>
      </div>

      <div className="grid gap-3 lg:grid-cols-5">
        {LEAD_STAGES.map((stage) => (
          <div
            key={stage}
            className="rounded-lg border border-black/10 bg-black/[0.02] dark:border-white/10 dark:bg-white/[0.03]"
          >
            <div className="flex items-center justify-between border-b border-black/10 px-3 py-2 text-sm font-medium dark:border-white/10">
              <span>{STAGE_LABEL[stage]}</span>
              <span className="opacity-50">{byStage[stage].length}</span>
            </div>
            <div className="space-y-2 p-2">
              {byStage[stage].length === 0 && (
                <p className="px-1 py-2 text-xs opacity-40">Vacío</p>
              )}
              {byStage[stage].map((c) => (
                <Link
                  key={c.id}
                  href={`/contacts/${c.id}`}
                  className="block rounded-md border border-black/10 bg-background p-2 text-sm hover:border-foreground dark:border-white/10"
                >
                  <div className="font-medium">
                    {c.firstName} {c.lastName}
                  </div>
                  {c.aiDesired && (
                    <div className="truncate text-xs opacity-70">{c.aiDesired}</div>
                  )}
                  <div className="mt-1">
                    <InterestBar score={c.interestScore} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
