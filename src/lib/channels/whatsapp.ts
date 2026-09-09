import type { ChannelAdapter, InboundMessage } from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";

/**
 * WhatsApp Business Platform (Meta Cloud API).
 * Las credenciales se configuran en Ajustes → Canales (o por variables de
 * entorno META_WHATSAPP_TOKEN / META_WHATSAPP_PHONE_ID / META_WEBHOOK_VERIFY_TOKEN).
 */
export const whatsappAdapter: ChannelAdapter = {
  channel: "WHATSAPP",

  isConfigured: (cfg) => cfg.whatsapp != null,

  verifyWebhook: (url, cfg) => {
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");
    if (mode === "subscribe" && token && cfg.verifyToken && token === cfg.verifyToken) {
      return { status: 200, body: challenge ?? "" };
    }
    return { status: 403, body: "forbidden" };
  },

  parseInbound: (payload) => {
    const out: InboundMessage[] = [];
    const body = payload as MetaWebhookBody;
    for (const entry of body?.entry ?? []) {
      for (const change of entry.changes ?? []) {
        const value = change.value;
        const contactsByWaId = new Map(
          (value?.contacts ?? []).map((c) => [c.wa_id, c.profile?.name])
        );
        for (const msg of value?.messages ?? []) {
          if (msg.type !== "text" || !msg.text?.body) continue;
          out.push({
            channel: "WHATSAPP",
            externalConversationId: msg.from,
            externalMessageId: msg.id,
            contact: {
              externalId: msg.from,
              phone: `+${msg.from}`,
              name: contactsByWaId.get(msg.from),
            },
            text: msg.text.body,
            timestamp: new Date(Number(msg.timestamp) * 1000),
          });
        }
      }
    }
    return out;
  },

  sendText: async (externalId, text, cfg) => {
    if (!cfg.whatsapp) throw new Error("WhatsApp no está configurado");
    const { token, phoneId } = cfg.whatsapp;

    const res = await fetch(`${GRAPH}/${phoneId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: externalId,
        type: "text",
        text: { body: text },
      }),
    });
    if (!res.ok) {
      throw new Error(`Error enviando WhatsApp: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { messages?: { id?: string }[] };
    return { externalMessageId: data.messages?.[0]?.id };
  },
};

type MetaWebhookBody = {
  entry?: {
    changes?: {
      value?: {
        contacts?: { wa_id: string; profile?: { name?: string } }[];
        messages?: {
          from: string;
          id: string;
          timestamp: string;
          type: string;
          text?: { body: string };
        }[];
      };
    }[];
  }[];
};
