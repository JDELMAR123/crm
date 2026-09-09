import type { ChannelType } from "@/generated/prisma/client";

/** Un mensaje entrante ya normalizado, venga del canal que venga. */
export type InboundMessage = {
  channel: ChannelType;
  /** Id del hilo/conversación en el canal de origen (para no duplicar). */
  externalConversationId: string;
  /** Id del mensaje en el canal de origen (para no duplicar). */
  externalMessageId?: string;
  contact: {
    /** Identificador del cliente en el canal (teléfono o id de IG). */
    externalId: string;
    name?: string;
    phone?: string;
  };
  text: string;
  timestamp: Date;
};

/** Credenciales de canales, resueltas desde los ajustes (o variables de entorno). */
export type ChannelConfig = {
  verifyToken: string | null;
  whatsapp: { token: string; phoneId: string } | null;
  instagram: { token: string; accountId: string } | null;
};

export interface ChannelAdapter {
  channel: ChannelType;
  /** Verificación del webhook (handshake de Meta). Devuelve el body a responder o null. */
  verifyWebhook(url: URL, cfg: ChannelConfig): { status: number; body: string } | null;
  /** Convierte el payload crudo del webhook en mensajes normalizados. */
  parseInbound(payload: unknown): InboundMessage[];
  /** Envía un mensaje de texto al cliente. */
  sendText(
    externalId: string,
    text: string,
    cfg: ChannelConfig
  ): Promise<{ externalMessageId?: string }>;
  /** ¿Está configurado el canal (credenciales presentes)? */
  isConfigured(cfg: ChannelConfig): boolean;
}
