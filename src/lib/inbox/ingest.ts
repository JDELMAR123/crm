import type { ChannelType } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import type { InboundMessage } from "@/lib/channels";

function channelIdField(channel: ChannelType): "whatsappId" | "instagramId" | null {
  if (channel === "WHATSAPP") return "whatsappId";
  if (channel === "INSTAGRAM") return "instagramId";
  return null;
}

/**
 * Da de alta un mensaje entrante: encuentra o crea el contacto y la
 * conversación, guarda el mensaje y marca la conversación como no leída.
 * Devuelve el id de la conversación (o null si el mensaje era un duplicado).
 */
export async function ingestInbound(
  msg: InboundMessage
): Promise<{ conversationId: string; isNew: boolean } | null> {
  // 1. Dedupe por id de mensaje del canal
  if (msg.externalMessageId) {
    const existing = await prisma.message.findUnique({
      where: { externalId: msg.externalMessageId },
      select: { conversationId: true },
    });
    if (existing) return null;
  }

  // 2. Contacto
  const idField = channelIdField(msg.channel);
  let contact =
    idField != null
      ? await prisma.contact.findFirst({ where: { [idField]: msg.contact.externalId } })
      : null;
  if (!contact && msg.contact.phone) {
    contact = await prisma.contact.findFirst({ where: { phone: msg.contact.phone } });
  }

  if (!contact) {
    const [firstName, ...rest] = (msg.contact.name ?? "").trim().split(/\s+/);
    contact = await prisma.contact.create({
      data: {
        firstName: firstName || msg.contact.phone || "Contacto nuevo",
        lastName: rest.join(" ") || null,
        phone: msg.contact.phone ?? null,
        ...(idField ? { [idField]: msg.contact.externalId } : {}),
      },
    });
  } else if (idField && !(contact as Record<string, unknown>)[idField]) {
    contact = await prisma.contact.update({
      where: { id: contact.id },
      data: { [idField]: msg.contact.externalId },
    });
  }

  // 3. Conversación
  const conversation = await prisma.conversation.upsert({
    where: {
      channel_externalId: {
        channel: msg.channel,
        externalId: msg.externalConversationId,
      },
    },
    create: {
      channel: msg.channel,
      externalId: msg.externalConversationId,
      contactId: contact.id,
      lastMessageAt: msg.timestamp,
      lastMessagePreview: msg.text.slice(0, 140),
      unread: true,
    },
    update: {
      lastMessageAt: msg.timestamp,
      lastMessagePreview: msg.text.slice(0, 140),
      unread: true,
    },
  });

  const wasEmpty = (await prisma.message.count({ where: { conversationId: conversation.id } })) === 0;

  // 4. Mensaje
  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      direction: "ENTRANTE",
      body: msg.text,
      externalId: msg.externalMessageId ?? null,
      createdAt: msg.timestamp,
    },
  });

  return { conversationId: conversation.id, isNew: wasEmpty };
}
