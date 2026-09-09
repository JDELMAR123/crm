"use server";

import { revalidatePath } from "next/cache";
import type { ChannelType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdapter, getChannelConfig } from "@/lib/channels";
import { ingestInbound } from "@/lib/inbox/ingest";
import { analyzeAndPersist } from "@/lib/ai/analyze";
import { requireUser } from "@/lib/auth";

function revalidateInbox(conversationId?: string) {
  revalidatePath("/inbox");
  revalidatePath("/pipeline");
  revalidatePath("/");
  if (conversationId) revalidatePath(`/inbox/${conversationId}`);
}

/** Envía una respuesta al cliente por el canal de la conversación. */
export async function sendReply(conversationId: string, text: string) {
  await requireUser();
  const body = text.trim();
  if (!body) return { error: "El mensaje está vacío." };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { contact: true },
  });
  if (!conversation) return { error: "Conversación no encontrada." };

  const adapter = getAdapter(conversation.channel);
  let externalMessageId: string | undefined;

  if (conversation.channel !== "SIMULADOR") {
    const cfg = await getChannelConfig();
    if (!adapter.isConfigured(cfg)) {
      return {
        error: `El canal ${conversation.channel} todavía no está conectado. El mensaje no se ha enviado.`,
      };
    }
    try {
      const externalId =
        conversation.channel === "WHATSAPP"
          ? conversation.contact.whatsappId
          : conversation.contact.instagramId;
      const res = await adapter.sendText(
        externalId ?? conversation.externalId,
        body,
        cfg
      );
      externalMessageId = res.externalMessageId;
    } catch (e) {
      return { error: e instanceof Error ? e.message : "No se pudo enviar." };
    }
  }

  await prisma.message.create({
    data: {
      conversationId,
      direction: "SALIENTE",
      body,
      externalId: externalMessageId ?? null,
    },
  });
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: body.slice(0, 140),
      unread: false,
      aiDraftReply: null,
    },
  });

  revalidateInbox(conversationId);
  return { ok: true };
}

/** Simula un mensaje entrante de un cliente (canal SIMULADOR). */
export async function simulateInbound(formData: FormData) {
  await requireUser();
  const name = String(formData.get("name") ?? "").trim() || "Cliente demo";
  const from = String(formData.get("from") ?? "").trim() || `demo-${name.toLowerCase().replace(/\s+/g, "-")}`;
  const channel = (String(formData.get("channel") ?? "SIMULADOR") as ChannelType) || "SIMULADOR";
  const text = String(formData.get("text") ?? "").trim();
  if (!text) return;

  const result = await ingestInbound({
    channel,
    externalConversationId: `${channel}:${from}`,
    externalMessageId: `sim-${Date.now()}`,
    contact: { externalId: from, name, phone: channel === "WHATSAPP" ? from : undefined },
    text,
    timestamp: new Date(),
  });

  if (result) {
    await analyzeAndPersist(result.conversationId);
    revalidateInbox(result.conversationId);
  }
}

/** Vuelve a pasar la IA sobre una conversación. */
export async function reanalyzeConversation(conversationId: string) {
  await requireUser();
  await analyzeAndPersist(conversationId);
  revalidateInbox(conversationId);
}

export async function markConversationRead(conversationId: string) {
  await requireUser();
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { unread: false },
  });
  revalidateInbox(conversationId);
}
