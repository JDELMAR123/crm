import { headers } from "next/headers";
import { requireCreator, CREATOR_EMAIL } from "@/lib/creator";
import { prisma } from "@/lib/prisma";
import { getSettings, getSettingsRow } from "@/lib/settings";
import { APP_VERSION } from "@/lib/version";
import { ModulesForm, NoticeForm } from "./_components/ControlForms";

export const dynamic = "force-dynamic";

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-black/10 py-2 text-sm dark:border-white/10">
      <span className="opacity-70">{label}</span>
      <span className={ok === false ? "text-amber-600 dark:text-amber-400" : ""}>
        {value}
      </span>
    </div>
  );
}

export default async function CreadorPage() {
  await requireCreator();

  const [settings, row, counts, migrations, host] = await Promise.all([
    getSettings(),
    getSettingsRow(),
    Promise.all([
      prisma.user.count(),
      prisma.contact.count(),
      prisma.conversation.count(),
      prisma.message.count(),
    ]),
    prisma
      .$queryRaw<{ count: bigint }[]>`SELECT count(*)::bigint FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`
      .then((r) => Number(r[0]?.count ?? 0))
      .catch(() => -1),
    headers().then((h) => h.get("host") ?? "desconocido"),
  ]);

  const [users, contacts, conversations, messages] = counts;

  const aiOk =
    settings.ai.configuredProvider === "simulation" ||
    (settings.ai.configuredProvider === "anthropic" && Boolean(settings.ai.apiKey));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Panel del creador</h1>
        <p className="opacity-70">
          Solo visible para <code>{CREATOR_EMAIL}</code>. Los administradores del
          cliente no ven esta página.
        </p>
      </div>

      <section className="rounded-lg border border-black/10 p-5 dark:border-white/10">
        <h2 className="mb-2 font-medium">Instalación</h2>
        <Row label="Negocio" value={settings.businessName} />
        <Row label="URL" value={host} />
        <Row label="Versión" value={`v${APP_VERSION}`} />
        <Row
          label="Alta de la instalación"
          value={row.createdAt.toLocaleString("es-ES")}
        />
        <Row label="Entorno" value={process.env.NODE_ENV ?? "—"} />
      </section>

      <section className="rounded-lg border border-black/10 p-5 dark:border-white/10">
        <h2 className="mb-2 font-medium">Diagnóstico</h2>
        <Row label="Base de datos" value="conectada" ok />
        <Row
          label="Migraciones aplicadas"
          value={migrations < 0 ? "no verificable" : String(migrations)}
          ok={migrations >= 0}
        />
        <Row
          label="Motor de IA"
          value={
            settings.ai.provider === "anthropic"
              ? "Claude (activo)"
              : settings.ai.configuredProvider === "anthropic"
                ? "Claude elegido pero SIN API key"
                : "Simulación"
          }
          ok={aiOk}
        />
        <Row
          label="WhatsApp"
          value={settings.channels.whatsapp ? "configurado" : "sin configurar"}
          ok={settings.channels.whatsapp != null}
        />
        <Row
          label="Instagram"
          value={settings.channels.instagram ? "configurado" : "sin configurar"}
          ok={settings.channels.instagram != null}
        />
        <Row
          label="Token de webhook"
          value={settings.channels.verifyToken ? "configurado" : "sin configurar"}
          ok={settings.channels.verifyToken != null}
        />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Usuarios", users],
            ["Contactos", contacts],
            ["Conversaciones", conversations],
            ["Mensajes", messages],
          ].map(([l, n]) => (
            <div
              key={l}
              className="rounded-md border border-black/10 p-3 text-center dark:border-white/10"
            >
              <div className="text-xl font-semibold">{n}</div>
              <div className="text-xs opacity-60">{l}</div>
            </div>
          ))}
        </div>
      </section>

      <ModulesForm disabled={settings.disabledModules} />
      <NoticeForm notice={settings.creatorNotice} />

      <p className="text-xs opacity-50">
        Como creador también tienes acceso completo a Ajustes y Equipo para dar soporte.
      </p>
    </div>
  );
}
