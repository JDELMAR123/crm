import type { ChannelAdapter } from "./types";

/**
 * Canal de pruebas. Permite simular mensajes entrantes y "enviar" respuestas
 * (que solo se registran en el CRM) sin ninguna integración externa.
 */
export const simuladorAdapter: ChannelAdapter = {
  channel: "SIMULADOR",
  verifyWebhook: () => null,
  parseInbound: () => [],
  isConfigured: () => true,
  async sendText() {
    return { externalMessageId: `sim_${Date.now()}` };
  },
};
