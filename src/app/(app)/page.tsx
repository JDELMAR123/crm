import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LEAD_STAGES, STAGE_LABEL } from "@/lib/ai/schema";
import { getSettings } from "@/lib/settings";
import {
  DEFAULT_BUSINESS_NAME,
  DEFAULT_PRODUCT_CATALOG,
} from "@/lib/settings/defaults";
import OnboardingChecklist from "./_components/OnboardingChecklist";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [total, unread, byStage, topLeads, settings, userCount, messageCount] =
    await Promise.all([
      prisma.contact.count(),
      prisma.conversation.count({ where: { unread: true } }),
      prisma.contact.groupBy({ by: ["stage"], _count: true }),
      prisma.contact.findMany({
        where: { interestScore: { not: null } },
        orderBy: { interestScore: "desc" },
        take: 5,
      }),
      getSettings(),
      prisma.user.count(),
      prisma.message.count(),
    ]);

  const stageCount = (s: string) =>
    byStage.find((g) => g.stage === s)?._count ?? 0;

  const onboardingSteps = [
    {
      label: "Personaliza el nombre de tu negocio",
      href: "/ajustes",
      done: settings.businessName !== DEFAULT_BUSINESS_NAME,
    },
    {
      label: "Revisa tu catálogo de productos",
      href: "/ajustes",
      done:
        JSON.stringify(settings.catalog) !==
        JSON.stringify(DEFAULT_PRODUCT_CATALOG),
    },
    {
      label: "Prueba la bandeja (simula un mensaje o conecta un canal)",
      href: "/inbox",
      done:
        messageCount > 0 ||
        settings.channels.whatsapp != null ||
        settings.channels.instagram != null,
    },
    {
      label: "Invita a tu equipo",
      href: "/equipo",
      done: userCount > 1,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Panel</h1>
        <p className="opacity-70">
          {settings.businessName} · motor de IA:{" "}
          {settings.ai.provider === "anthropic" ? "avanzada" : "básica"}
        </p>
      </div>

      <OnboardingChecklist steps={onboardingSteps} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat value={total} label="Contactos" href="/contacts" />
        <Stat value={unread} label="Mensajes sin leer" href="/inbox" />
        <Stat
          value={stageCount("EN_PROCESO_DE_COMPRA")}
          label="En proceso de compra"
          href="/pipeline"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-5">
        {LEAD_STAGES.map((s) => (
          <div
            key={s}
            className="rounded-lg border border-black/10 p-3 text-center dark:border-white/10"
          >
            <div className="text-2xl font-semibold">{stageCount(s)}</div>
            <div className="text-xs opacity-60">{STAGE_LABEL[s]}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Leads más calientes</h2>
          <Link href="/pipeline" className="text-sm opacity-70 hover:opacity-100">
            Ver pipeline →
          </Link>
        </div>
        {topLeads.length === 0 ? (
          <p className="opacity-70">
            Aún no hay leads analizados. Ve a la{" "}
            <Link href="/inbox" className="underline">
              bandeja
            </Link>{" "}
            y simula un mensaje.
          </p>
        ) : (
          <ul className="divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
            {topLeads.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/contacts/${c.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="font-medium">
                    {c.firstName} {c.lastName}
                  </span>
                  <span className="text-sm opacity-70">
                    {c.aiDesired || "—"} · interés {c.interestScore}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  href,
}: {
  value: number;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-black/10 p-4 hover:border-foreground dark:border-white/10"
    >
      <div className="text-3xl font-semibold">{value}</div>
      <div className="text-sm opacity-70">{label}</div>
    </Link>
  );
}
