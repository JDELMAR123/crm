import { after } from "next/server";
import { revalidatePath } from "next/cache";
import type { ChannelType } from "@/generated/prisma/client";
import { getAdapter } from "@/lib/channels";
import { ingestInbound } from "@/lib/inbox/ingest";
import { analyzeAndPersist } from "@/lib/ai/analyze";

/**
 * Procesa el payload crudo de un webhook de canal (WhatsApp / Instagram).
 *
 * Todo el trabajo (guardar el mensaje + análisis con IA) se hace en `after()`,
 * después de responder 200 a Meta. Meta desactiva los webhooks que devuelven
 * errores, así que la ruta nunca debe fallar por el procesamiento.
 */
export function ingestFromWebhook(channel: ChannelType, payload: unknown): void {
  after(async () => {
    try {
      const adapter = getAdapter(channel);
      const messages = adapter.parseInbound(payload);
      for (const msg of messages) {
        const result = await ingestInbound(msg);
        if (!result) continue;
        await analyzeAndPersist(result.conversationId);
        revalidatePath("/inbox");
        revalidatePath("/pipeline");
        revalidatePath("/");
        revalidatePath(`/inbox/${result.conversationId}`);
      }
    } catch (err) {
      console.error("[webhook] error procesando mensaje entrante:", err);
    }
  });
}
