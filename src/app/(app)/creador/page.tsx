import { headers } from "next/headers";
import { requireCreator, CREATOR_EMAIL } from "@/lib/creator";
import { prisma } from "@/lib/prisma";
import { getSettings, getSettingsRow } from "@/lib/settings";
import { APP_VERSION } from "@/lib/version";
import { ModulesForm, NoticeForm } from "./_components/ControlForms";
import {
  LicenseConfigForm,
  LicenseKeyForm,
  LicenseClaimsList,
  LicenseGeneratorForm,
  IssuedLicensesList,
} from "./_components/LicenseForms";

export const dynamic = "force-dynamic";

function Row({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="hk-row">
      <span className="hk-row-label">{label}</span>
      <span className={`hk-row-value${ok === false ? " hk-warn-text" : ""}`}>
        {value}
      </span>
    </div>
  );
}

export default async function CreadorPage() {
  await requireCreator();

  // Solo tu propia instalación (la que tenga esta env var) puede generar
  // claves de licencia — en las de tus clientes no aparece.
  const canGenerateLicenses = Boolean(process.env.LICENSE_SIGNING_PRIVATE_KEY);

  const [settings, row, counts, migrations, host, claims, issuedLicenses] = await Promise.all([
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
    prisma.licensePaymentClaim.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    canGenerateLicenses
      ? prisma.issuedLicense.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
      : Promise.resolve([]),
  ]);

  const [users, contacts, conversations, messages] = counts;

  const aiOk =
    settings.ai.configuredProvider === "simulation" ||
    (settings.ai.configuredProvider === "anthropic" && Boolean(settings.ai.apiKey));

  return (
    <div>
      <div className="hk-prompt">root@{host}:~$ whoami --creator</div>
      <h1 className="hk-title hk-cursor">Panel del creador</h1>
      <p className="hk-sub">
        Solo visible para <code>{CREATOR_EMAIL}</code>. Los administradores del
        cliente no ven esta página.
      </p>

      <div className="hk-stack">
        <section className="hk-section">
          <h2 className="hk-section-title">Instalación</h2>
          <Row label="Negocio" value={settings.businessName} />
          <Row label="URL" value={host} />
          <Row label="Versión" value={`v${APP_VERSION}`} />
          <Row label="Alta de la instalación" value={row.createdAt.toLocaleString("es-ES")} />
          <Row label="Entorno" value={process.env.NODE_ENV ?? "—"} />
        </section>

        <section className="hk-section">
          <h2 className="hk-section-title">Diagnóstico</h2>
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
          <div className="hk-stats">
            {[
              ["Usuarios", users],
              ["Contactos", contacts],
              ["Conversaciones", conversations],
              ["Mensajes", messages],
            ].map(([l, n]) => (
              <div key={l} className="hk-stat">
                <div className="hk-stat-n">{n}</div>
                <div className="hk-stat-l">{l}</div>
              </div>
            ))}
          </div>
        </section>

        <LicenseConfigForm
          enabled={settings.license.enabled}
          priceLabel={settings.license.priceLabel}
          instructions={settings.license.instructions}
        />
        {settings.license.enabled && (
          <LicenseKeyForm keyLabel={settings.license.keyLabel} valid={settings.license.paid} />
        )}
        {settings.license.enabled && !settings.license.paid && (
          <LicenseClaimsList claims={claims} />
        )}
        {canGenerateLicenses && (
          <>
            <LicenseGeneratorForm origin={`https://${host}`} />
            <IssuedLicensesList licenses={issuedLicenses} />
          </>
        )}

        <ModulesForm disabled={settings.disabledModules} />
        <NoticeForm notice={settings.creatorNotice} />

        <p className="hk-footnote">
          &gt; como creador también tienes acceso completo a Ajustes y Equipo para dar soporte.
        </p>
      </div>
    </div>
  );
}
