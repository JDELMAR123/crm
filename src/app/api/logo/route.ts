import { getLogoDataUri } from "@/lib/settings";

/** Sirve el logo de la instalación (subido en Ajustes → Marca). */
export async function GET() {
  const dataUri = await getLogoDataUri();
  const match = dataUri
    ? /^data:([\w/+.-]+);base64,([\s\S]+)$/.exec(dataUri)
    : null;

  if (!match) return new Response("sin logo", { status: 404 });

  const [, mime, b64] = match;
  const buffer = Buffer.from(b64, "base64");

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": mime,
      "Cache-Control": "public, max-age=300, must-revalidate",
    },
  });
}
