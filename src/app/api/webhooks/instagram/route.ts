import { getAdapter, getChannelConfig } from "@/lib/channels";
import { ingestFromWebhook } from "@/lib/inbox/webhook";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const cfg = await getChannelConfig();
  const result = getAdapter("INSTAGRAM").verifyWebhook(url, cfg);
  if (!result) return new Response("no verify", { status: 400 });
  return new Response(result.body, { status: result.status });
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return new Response("bad json", { status: 400 });
  }
  ingestFromWebhook("INSTAGRAM", payload);
  return new Response("ok", { status: 200 });
}
