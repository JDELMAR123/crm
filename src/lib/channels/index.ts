import type { ChannelType } from "@/generated/prisma/client";
import type { ChannelAdapter } from "./types";
import { simuladorAdapter } from "./simulador";
import { whatsappAdapter } from "./whatsapp";
import { instagramAdapter } from "./instagram";

export { CHANNEL_LABEL } from "./labels";

const ADAPTERS: Record<ChannelType, ChannelAdapter> = {
  SIMULADOR: simuladorAdapter,
  WHATSAPP: whatsappAdapter,
  INSTAGRAM: instagramAdapter,
};

export function getAdapter(channel: ChannelType): ChannelAdapter {
  return ADAPTERS[channel];
}

/** Credenciales de canales tomadas de los ajustes de la instalación. */
export async function getChannelConfig() {
  const { getSettings } = await import("@/lib/settings");
  return (await getSettings()).channels;
}

export type { ChannelAdapter, ChannelConfig, InboundMessage } from "./types";
