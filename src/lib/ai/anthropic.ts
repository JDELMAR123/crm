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

  const catalogBlock =
    input.products.length > 0
      ? input.products
          .map((p) => {
            const parts = [
              `- ${p.name}`,
              p.category ? `(${p.category})` : "",
              p.price != null ? `— ${p.price}` : "",
              p.description ? `: ${p.description}` : "",
            ].filter(Boolean);
            return parts.join(" ");
          })
          .join("\n")
      : "(No hay productos configurados todavía; no asumas ningún catálogo concreto.)";

  const response = await client.messages.parse({
    model: opts.model,
    max_tokens: 4000,
    thinking: { type: "adaptive" },
    system: `Eres un analista de ventas. Clasificas conversaciones de clientes para el CRM de un negocio, cuyo rubro puede variar (no asumas que es una tienda de ropa u otro nicho concreto salvo que el contexto o el catálogo lo indiquen).

Contexto del negocio:
${input.businessContext}

Catálogo de productos/servicios configurado:
${catalogBlock}

Reglas:
- Usa el catálogo para identificar qué quiere el cliente. Si menciona algo que no está en el catálogo, dilo tal cual en "desired" pero no inventes un precio ni lo confundas con un producto listado.
- Si el cliente cambia de tema (pregunta por otro producto más adelante en la conversación), prioriza lo último que pidió sobre lo que mencionó al principio.
- Cuando el precio de un producto esté en el catálogo, menciónalo de forma explícita y correcta en "nextStep" y en "draftReply" (calcula el total si pide más de una unidad); no des precios que no estén en el catálogo.
- Sé conciso y realista con el nivel de interés: no asumas intención de compra alta solo por preguntar precio o disponibilidad.

Devuelve SIEMPRE el análisis en el formato estructurado pedido.`,
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
