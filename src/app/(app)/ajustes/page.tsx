import { requireAdmin } from "@/lib/auth";
import { getSettingsRow } from "@/lib/settings";
import type { CatalogEntry } from "@/lib/settings/defaults";
import {
  saveAi,
  saveBusiness,
  saveCatalog,
  saveChannels,
} from "@/lib/actions/settings";
import SettingsSection, {
  SecretField,
  inputClass,
} from "./_components/SettingsSection";
import AiProviderChoice from "./_components/AiProviderChoice";

export const dynamic = "force-dynamic";

function catalogToText(raw: string): string {
  try {
    const list = JSON.parse(raw) as CatalogEntry[];
    return list.map((e) => `${e.name}: ${e.keywords.join(", ")}`).join("\n");
  } catch {
    return "";
  }
}

function colorsToText(raw: string): string {
  try {
    return (JSON.parse(raw) as string[]).join(", ");
  } catch {
    return "";
  }
}

export default async function AjustesPage() {
  await requireAdmin();
  const s = await getSettingsRow();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Ajustes</h1>
        <p className="opacity-70">
          Configura tu CRM sin tocar código. Solo los administradores ven esta página.
        </p>
      </div>

      <SettingsSection
        title="Negocio"
        description="Nombre que aparece en el CRM."
        action={saveBusiness}
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Nombre del negocio</span>
          <input
            name="businessName"
            defaultValue={s.businessName}
            className={inputClass}
          />
        </label>
      </SettingsSection>

      <SettingsSection
        title="Inteligencia artificial"
        description="Cómo se analizan las conversaciones para sectorizar a los clientes."
        action={saveAi}
      >
        <AiProviderChoice
          defaultValue={s.aiProvider === "anthropic" ? "anthropic" : "simulation"}
        />
        <SecretField
          name="aiApiKey"
          label="Clave de API de la IA avanzada"
          isSet={Boolean(s.aiApiKey)}
        />
        <input type="hidden" name="aiModel" value={s.aiModel} />
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Contexto del negocio</span>
          <span className="block text-xs opacity-60">
            Describe qué vendes y qué te preguntan los clientes. La IA lo usa para clasificar mejor.
          </span>
          <textarea
            name="aiBusinessContext"
            defaultValue={s.aiBusinessContext}
            rows={7}
            className={inputClass}
          />
        </label>
      </SettingsSection>

      <SettingsSection
        title="Catálogo de productos"
        description="Lo usa el motor de simulación para reconocer qué quiere el cliente."
        action={saveCatalog}
      >
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Productos</span>
          <span className="block text-xs opacity-60">
            Un producto por línea, con el formato <code>Nombre: palabra1, palabra2, …</code>
            (todas las formas en que un cliente puede nombrarlo).
          </span>
          <textarea
            name="catalog"
            defaultValue={catalogToText(s.productCatalog)}
            rows={9}
            className={`${inputClass} font-mono`}
          />
        </label>
        <label className="block space-y-1 text-sm">
          <span className="font-medium">Colores</span>
          <span className="block text-xs opacity-60">Separados por comas.</span>
          <input
            name="colors"
            defaultValue={colorsToText(s.colorWords)}
            className={inputClass}
          />
        </label>
      </SettingsSection>

      <SettingsSection
        title="Canales (WhatsApp e Instagram)"
        description="Credenciales de tu app de Meta. Guía paso a paso en docs/META_SETUP.md."
        action={saveChannels}
      >
        <SecretField
          name="metaVerifyToken"
          label="Token de verificación del webhook"
          isSet={Boolean(s.metaVerifyToken)}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <SecretField name="waToken" label="WhatsApp · token de acceso" isSet={Boolean(s.waToken)} />
          <SecretField name="waPhoneId" label="WhatsApp · Phone Number ID" isSet={Boolean(s.waPhoneId)} />
          <SecretField name="igToken" label="Instagram · token de acceso" isSet={Boolean(s.igToken)} />
          <SecretField name="igAccountId" label="Instagram · Account ID" isSet={Boolean(s.igAccountId)} />
        </div>
      </SettingsSection>
    </div>
  );
}
