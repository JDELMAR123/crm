import type { ChannelAdapter, InboundMessage } from "./types";

const GRAPH = "https://graph.facebook.com/v21.0";

/**
 * Instagram Messaging API (parte de la Messenger Platform de Meta).
 * Credenciales en Ajustes → Canales (o env META_INSTAGRAM_TOKEN /
 * META_INSTAGRAM_ACCOUNT_ID / META_WEBHOOK_VERIFY_TOKEN).
 */
export const instagramAdapter: ChannelAdapter = {
  channel: "INSTAGRAM",

  isConfigured: (cfg) => cfg.instagram != null,

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
    const body = payload as IgWebhookBody;
    for (const entry of body?.entry ?? []) {
      for (const event of entry.messaging ?? []) {
        if (!event.message?.text || event.message.is_echo) continue;
        out.push({
          channel: "INSTAGRAM",
          externalConversationId: event.sender.id,
          externalMessageId: event.message.mid,
          contact: { externalId: event.sender.id },
          text: event.message.text,
          timestamp: new Date(event.timestamp ?? Date.now()),
        });
      }
    }
    return out;
  },

  sendText: async (externalId, text, cfg) => {
    if (!cfg.instagram) throw new Error("Instagram no está configurado");
    const { token, accountId } = cfg.instagram;

    const res = await fetch(`${GRAPH}/${accountId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: externalId },
        message: { text },
      }),
    });
    if (!res.ok) {
      throw new Error(`Error enviando Instagram: ${res.status} ${await res.text()}`);
    }
    const data = (await res.json()) as { message_id?: string };
    return { externalMessageId: data.message_id };
  },
};

type IgWebhookBody = {
  entry?: {
    messaging?: {
      sender: { id: string };
      timestamp?: number;
      message?: { mid: string; text?: string; is_echo?: boolean };
    }[];
  }[];
};
