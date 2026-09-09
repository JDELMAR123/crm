import { getSettings } from "@/lib/settings";
import { BrandMark, BrandStyle } from "@/components/Brand";

export const dynamic = "force-dynamic";

export default async function AuthLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();

  return (
    <div className="flex min-h-full items-center justify-center px-6 py-12">
      <BrandStyle branding={settings.branding} />
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <BrandMark
            businessName={settings.businessName}
            branding={settings.branding}
          />
        </div>
        {children}
      </div>
    </div>
  );
}
