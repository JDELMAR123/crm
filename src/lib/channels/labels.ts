import type { ChannelType } from "@/generated/prisma/client";

/** Etiquetas de canal. Módulo sin dependencias de servidor (uso en cliente). */
export const CHANNEL_LABEL: Record<ChannelType, string> = {
  SIMULADOR: "Simulador",
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
};
