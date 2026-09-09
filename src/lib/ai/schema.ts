import { z } from "zod";
import type { CatalogEntry } from "@/lib/settings/defaults";

export const LEAD_STAGES = [
  "NUEVO",
  "INTERESADO",
  "EN_PROCESO_DE_COMPRA",
  "CLIENTE",
  "PERDIDO",
] as const;

export const STAGE_LABEL: Record<(typeof LEAD_STAGES)[number], string> = {
  NUEVO: "Nuevo",
  INTERESADO: "Interesado",
  EN_PROCESO_DE_COMPRA: "En proceso de compra",
  CLIENTE: "Cliente",
  PERDIDO: "Perdido",
};

/** Estructura que devuelve el motor de IA al analizar una conversación. */
export const ConversationAnalysisSchema = z.object({
  stage: z.enum(LEAD_STAGES).describe("Etapa del cliente en el embudo de venta"),
  interestScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("Nivel de interés estimado, de 0 a 100"),
  desired: z
    .string()
    .describe(
      "Qué producto o productos quiere el cliente. Vacío si no se menciona ninguno."
    ),
  sentiment: z
    .enum(["positivo", "neutral", "negativo"])
    .describe("Tono general del cliente"),
  signals: z
    .object({
      budget: z.string().describe("Señales sobre presupuesto o precio. Vacío si no hay."),
      urgency: z.string().describe("Señales de urgencia o plazos. Vacío si no hay."),
      objections: z.string().describe("Dudas u objeciones del cliente. Vacío si no hay."),
    })
    .describe("Señales de compra detectadas"),
  summary: z.string().describe("Resumen de la conversación en 1-2 frases"),
  nextStep: z
    .string()
    .describe("Siguiente acción recomendada para el vendedor, en una frase"),
  draftReply: z
    .string()
    .describe(
      "Borrador de respuesta al cliente, en español, tono cercano y profesional, listo para revisar y enviar"
    ),
});

export type ConversationAnalysis = z.infer<typeof ConversationAnalysisSchema>;

export type AnalysisInput = {
  messages: { direction: "ENTRANTE" | "SALIENTE"; body: string }[];
  contactName: string;
  channel: string;
  catalog: CatalogEntry[];
  colorWords: string[];
  businessContext: string;
};
