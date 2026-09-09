import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { analyzeWithSimulation } from "./simulation";
import type { AnalysisInput, ConversationAnalysis } from "./schema";

export async function analyzeConversationMessages(
  input: AnalysisInput
): Promise<{ analysis: ConversationAnalysis; provider: string }> {
  const { ai } = await getSettings();

  if (ai.provider === "anthropic" && ai.apiKey) {
    // Import diferido: el SDK solo se carga si se usa la IA avanzada.
    const { analyzeWithClaude } = await import("./anthropic");
    return {
      analysis: await analyzeWithClaude(input, { apiKey: ai.apiKey, model: ai.model }),
      provider: "anthropic",
    };
  }
  return { analysis: analyzeWithSimulation(input), provider: "simulation" };
}

/**
 * Analiza una conversación y guarda el resultado en la Conversación y en el
 * Contacto asociado. Se llama tras cada mensaje entrante.
 */
export async function analyzeAndPersist(conversationId: string): Promise<void> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      contact: true,
      messages: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!conversation) return;

  const settings = await getSettings();
  if (settings.disabledModules.includes("ia")) return;

  const { analysis } = await analyzeConversationMessages({
    channel: conversation.channel,
    contactName: conversation.contact.firstName,
    messages: conversation.messages.map((m) => ({
      direction: m.direction,
      body: m.body,
    })),
    catalog: settings.catalog,
    colorWords: settings.colorWords,
    businessContext: settings.ai.businessContext,
  });

  const now = new Date();

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      aiStage: analysis.stage,
      aiInterest: analysis.interestScore,
      aiDesired: analysis.desired,
      aiSentiment: analysis.sentiment,
      aiSignals: JSON.stringify(analysis.signals),
      aiSummary: analysis.summary,
      aiNextStep: analysis.nextStep,
      aiDraftReply: analysis.draftReply,
      aiAnalyzedAt: now,
    },
  });
  await prisma.contact.update({
    where: { id: conversation.contactId },
    data: {
      stage: analysis.stage,
      interestScore: analysis.interestScore,
      aiSummary: analysis.summary,
      aiDesired: analysis.desired,
      aiNextStep: analysis.nextStep,
      aiAnalyzedAt: now,
    },
  });
}
