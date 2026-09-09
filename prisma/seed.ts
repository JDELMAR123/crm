import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// Usuario administrador para desarrollo local.
// En producción NO se ejecuta el seed: la app arranca vacía y muestra el
// asistente de configuración (/setup) para crear el primer administrador.
const DEV_ADMIN = { name: "Admin Demo", email: "admin@demo.local", password: "demo1234" };

const contacts = [
  {
    firstName: "Ana",
    lastName: "García",
    email: "ana.garcia@example.com",
    phone: "+34 600 111 222",
    company: "Acme S.L.",
    notes: "Interesada en el plan anual.",
  },
  {
    firstName: "Luis",
    lastName: "Martínez",
    email: "luis.martinez@example.com",
    phone: "+34 600 333 444",
    company: "Globex",
  },
  {
    firstName: "María",
    lastName: "López",
    email: "maria.lopez@example.com",
    company: "Initech",
    notes: "Contactar tras el verano.",
  },
];

const demoConversations = [
  {
    contactEmail: "ana.garcia@example.com",
    channel: "WHATSAPP" as const,
    channelId: { whatsappId: "34600111222" },
    messages: [
      "Hola, ¿tenéis la camiseta azul en talla M?",
      "Perfecto. ¿Cuánto cuesta y cuánto tarda el envío a Madrid?",
      "Genial, me lo llevo. ¿Cómo pago?",
    ],
    analysis: {
      aiStage: "EN_PROCESO_DE_COMPRA" as const,
      aiInterest: 88,
      aiDesired: "Camisetas talla M color azul",
      aiSentiment: "positivo",
      aiSignals: JSON.stringify({ budget: "", urgency: "", objections: "" }),
      aiSummary:
        "Ana escribe por WHATSAPP interesándose por camisetas (talla M, azul). Pregunta por cómo pagar. Interés estimado 88/100.",
      aiNextStep:
        "Confirmar camisetas (talla M, azul), pedir dirección de envío y mandar el enlace de pago.",
      aiDraftReply:
        "¡Hola Ana! Genial 🙌 Te preparo el pedido de camisetas (talla M, azul). ¿Me confirmas la dirección de envío? Te paso el enlace de pago y, si lo confirmas hoy, lo enviamos hoy mismo.",
    },
  },
  {
    contactEmail: "luis.martinez@example.com",
    channel: "INSTAGRAM" as const,
    channelId: { instagramId: "ig_luis_martinez" },
    messages: [
      "Buenas, vi las zapatillas en vuestro perfil",
      "Me parece un poco caro, me lo pienso",
    ],
    analysis: {
      aiStage: "INTERESADO" as const,
      aiInterest: 34,
      aiDesired: "Zapatillas",
      aiSentiment: "neutral",
      aiSignals: JSON.stringify({
        budget: "Sensible al precio (menciona caro/descuento)",
        urgency: "",
        objections: "Duda / se lo piensa",
      }),
      aiSummary:
        "Luis escribe por INSTAGRAM interesándose por zapatillas. Pregunta por información general. Interés estimado 34/100.",
      aiNextStep:
        "Enviar precio y disponibilidad de zapatillas. Pedir talla y color para poder cerrar.",
      aiDraftReply:
        "¡Hola Luis! Gracias por escribirnos. Cuéntame qué zapatillas buscas (modelo, talla o color) y te digo precio y disponibilidad enseguida.",
    },
  },
];

async function main() {
  await prisma.user.upsert({
    where: { email: DEV_ADMIN.email },
    update: {},
    create: {
      name: DEV_ADMIN.name,
      email: DEV_ADMIN.email,
      passwordHash: await bcrypt.hash(DEV_ADMIN.password, 10),
      role: "ADMIN",
    },
  });

  for (const data of contacts) {
    await prisma.contact.upsert({
      where: { email: data.email },
      update: data,
      create: data,
    });
  }

  for (const conv of demoConversations) {
    const contact = await prisma.contact.update({
      where: { email: conv.contactEmail },
      data: {
        ...conv.channelId,
        stage: conv.analysis.aiStage,
        interestScore: conv.analysis.aiInterest,
        aiSummary: conv.analysis.aiSummary,
        aiDesired: conv.analysis.aiDesired,
        aiNextStep: conv.analysis.aiNextStep,
        aiAnalyzedAt: new Date(),
      },
    });

    const externalId = `${conv.channel}:${conv.contactEmail}`;
    const conversation = await prisma.conversation.upsert({
      where: { channel_externalId: { channel: conv.channel, externalId } },
      update: {},
      create: {
        channel: conv.channel,
        externalId,
        contactId: contact.id,
        lastMessagePreview: conv.messages.at(-1)?.slice(0, 140),
      },
    });

    await prisma.message.deleteMany({ where: { conversationId: conversation.id } });
    for (const body of conv.messages) {
      await prisma.message.create({
        data: { conversationId: conversation.id, direction: "ENTRANTE", body },
      });
    }

    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { ...conv.analysis, aiAnalyzedAt: new Date() },
    });
  }

  console.log(
    `Seed completado: admin (${DEV_ADMIN.email} / ${DEV_ADMIN.password}), ` +
      `${contacts.length} contactos, ${demoConversations.length} conversaciones.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
