import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
  ConversationAnalysisSchema,
  type AnalysisInput,
  type ConversationAnalysis,
} from "./schema";

/**
 * Motor de IA real con Claude. Se usa cuando en los ajustes se elige el
 * proveedor "anthropic" y hay una API key configurada.
 */
export async function analyzeWithClaude(
  input: AnalysisInput,
  opts: { apiKey: string; model: string }
): Promise<ConversationAnalysis> {
  const client = new Anthropic({ apiKey: opts.apiKey });

  const transcript = input.messages
    .map(
      (m) => `${m.direction === "ENTRANTE" ? "Cliente" : "Nosotros"}: ${m.body}`
    )
    .join("\n");

  const response = await client.messages.parse({
    model: opts.model,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    system: `Eres un analista de ventas de un e-commerce. Clasificas conversaciones de clientes para el CRM.\n\nContexto del negocio:\n${input.businessContext}\n\nDevuelve SIEMPRE el análisis en el formato estructurado pedido. Sé conciso y realista con el nivel de interés.`,
    messages: [
      {
        role: "user",
        content: `Cliente: ${input.contactName}\nCanal: ${input.channel}\n\nConversación:\n${transcript}\n\nAnaliza esta conversación.`,
      },
    ],
    output_config: {
      format: zodOutputFormat(ConversationAnalysisSchema),
    },
  });

  if (!response.parsed_output) {
    throw new Error("Claude no devolvió un análisis válido");
  }
  return response.parsed_output;
}
