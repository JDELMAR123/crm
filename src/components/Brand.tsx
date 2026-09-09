import type { ResolvedSettings } from "@/lib/settings";

/** Inyecta el color de marca como variables CSS globales. Poner una vez por página. */
export function BrandStyle({ branding }: { branding: ResolvedSettings["branding"] }) {
  if (!branding.color) return null;
  const css = `:root{--brand:${branding.color};--brand-contrast:${branding.colorContrast ?? "#fff"};}`;
  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

/** Logo de la instalación, o el nombre del negocio si no hay logo. */
export function BrandMark({
  businessName,
  branding,
  className = "",
}: {
  businessName: string;
  branding: ResolvedSettings["branding"];
  className?: string;
}) {
  if (branding.hasLogo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/api/logo?v=${branding.logoVersion}`}
        alt={businessName}
        className={`h-7 w-auto max-w-[180px] object-contain ${className}`}
      />
    );
  }
  return <span className={`text-lg font-semibold ${className}`}>{businessName}</span>;
}
