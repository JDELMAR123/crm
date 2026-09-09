import type { CatalogEntry } from "@/lib/settings/defaults";
import type { AnalysisInput, ConversationAnalysis } from "./schema";

/**
 * Motor de IA "simulado": heurística local en español. No hace llamadas
 * externas ni tiene coste. Reconoce productos del catálogo, tallas, colores,
 * tipo de pregunta e intención de compra, y con eso decide etapa, interés,
 * resumen, siguiente paso y un borrador de respuesta.
 *
 * El catálogo y los colores se editan en Ajustes. Cuando se activa la IA
 * avanzada, este archivo deja de usarse.
 */

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

const anyOf = (text: string, words: string[]) =>
  words.some((w) => text.includes(norm(w)));

function detectProduct(text: string, catalog: CatalogEntry[]): string {
  for (const p of catalog) {
    if (p.keywords.some((k) => text.includes(norm(k)))) return p.name;
  }
  return "";
}

function detectSize(text: string): string {
  const m =
    text.match(/\btalla\s*[:\-]?\s*(xxl|xl|xs|s|m|l|\d{2}(?:[.,]\d)?)\b/i) ??
    text.match(/\b(\d{2})\s*(?:de\s*pie|europ|eu)\b/i);
  return m ? m[1].toUpperCase() : "";
}

function detectColor(text: string, colorWords: string[]): string {
  // Acepta género y plural: "negro" reconoce "negra", "negras"…
  const hit = colorWords.find((c) => {
    const w = norm(c);
    return text.includes(w) || new RegExp(`\\b${w.slice(0, -1)}[oae]s?\\b`).test(text);
  });
  return hit ?? "";
}

function detectQuantity(text: string): number {
  const digits = text.match(/\b(\d{1,3})\s*(unidad|unidades|uds|pares?|piezas?)\b/i);
  if (digits) return Number(digits[1]);
  const words: Record<string, number> = { dos: 2, tres: 3, cuatro: 4, cinco: 5 };
  for (const [w, n] of Object.entries(words)) {
    if (new RegExp(`\\b${w}\\b`).test(text)) return n;
  }
  return 1;
}

export function analyzeWithSimulation(input: AnalysisInput): ConversationAnalysis {
  const inboundRaw = input.messages.filter((m) => m.direction === "ENTRANTE");
  const inbound = inboundRaw.map((m) => norm(m.body));
  const allText = inbound.join("  \n  ");
  const lastText = inbound.at(-1) ?? "";

  const has = (...w: string[]) => anyOf(allText, w);
  const lastHas = (...w: string[]) => anyOf(lastText, w);

  // --- Entidades ---------------------------------------------------------
  const product = detectProduct(allText, input.catalog);
  const size = detectSize(allText);
  const color = detectColor(allText, input.colorWords);
  const quantity = detectQuantity(allText);

  // --- Tipo de preguntas -----------------------------------------------
  const asksPrice = has("precio", "cuanto cuesta", "cuanto vale", "cuanto es", "que precio", "€", "euros", "cuestan");
  const asksStock = has("hay", "teneis", "tienes", "disponible", "disponibilidad", "stock", "queda", "quedan", "agotad");
  const asksSizing = has("talla", "medidas", "equivale", "me vale", "que talla");
  const asksShipping = has("envio", "enviais", "mandais", "llega", "tarda", "cuando lo tengo", "correos", "mensajeria", "seguimiento");
  const asksPayment = has("pago", "pagar", "como pago", "tarjeta", "bizum", "transferencia", "contra reembolso", "paypal", "enlace de pago");
  const asksReturns = has("devol", "cambio de talla", "talla equivocada", "reembolso", "me queda mal");

  // --- Intención ------------------------------------------------------
  const buyIntent = has("quiero", "me lo llevo", "lo compro", "comprar", "me interesa", "resérva", "reserva", "aparta", "lo cojo", "dame");
  const confirmedPurchase = has("ya lo compre", "ya lo he comprado", "pedido recibido", "me llego", "numero de pedido", "gracias por el envio", "ya me llego");
  const rejection = has("no me interesa", "dejalo", "ya no quiero", "cancelar", "encontre otro", "en otro sitio", "no gracias");
  const hesitation = has("me lo pienso", "otro dia", "dejame ver", "no se", "lo consulto", "mas adelante", "ya te digo");

  // --- Puntuación de interés -----------------------------------------
  let score = 12;
  if (inbound.length === 0) score = 0;
  if (has("hola", "buenas", "informacion", "consulta", "pregunta")) score += 6;
  if (product) score += 10;
  if (asksPrice) score += 12;
  if (asksStock || asksSizing) score += 10;
  if (asksShipping) score += 16;
  if (asksPayment) score += 24;
  if (buyIntent) score += 26;
  if (size || color) score += 6;
  if (inbound.length >= 3) score += 8;
  // El último mensaje pesa más: si ahí hay pago o compra, sube fuerte
  if (lastHas("pago", "pagar", "quiero", "me lo llevo", "lo compro", "enlace")) score += 12;
  if (hesitation) score -= 22;
  if (rejection) score -= 40;
  score = Math.max(0, Math.min(100, score));

  // --- Etapa --------------------------------------------------------
  let stage: ConversationAnalysis["stage"] = "NUEVO";
  if (score >= 45) stage = "INTERESADO";
  if (asksPayment || (buyIntent && score >= 65) || score >= 78) stage = "EN_PROCESO_DE_COMPRA";
  if (confirmedPurchase) stage = "CLIENTE";
  if (rejection) stage = "PERDIDO";

  // --- Sentimiento ------------------------------------------------
  const sentiment: ConversationAnalysis["sentiment"] = has(
    "gracias",
    "genial",
    "perfecto",
    "me encanta",
    "estupendo",
    "que bien"
  )
    ? "positivo"
    : has("caro", "carisimo", "fatal", "tarde", "no funciona", "decepcion", "queja", "mal servicio")
      ? "negativo"
      : "neutral";

  // --- Señales ----------------------------------------------------
  const priceMention = allText.match(/(\d+(?:[.,]\d+)?)\s*(?:€|eur|euros)/);
  const dateMention = allText.match(/\b(hoy|manana|pasado manana|este finde|el (?:lunes|martes|miercoles|jueves|viernes|sabado|domingo)|antes del \w+)\b/);
  const signals = {
    budget: priceMention
      ? `Menciona ${priceMention[0]}`
      : has("caro", "descuento", "oferta", "rebaja", "presupuesto")
        ? "Sensible al precio (menciona caro/descuento)"
        : "",
    urgency: has("urgente", "cuanto antes", "para ya", "lo necesito ya", "es para un regalo")
      ? "Pide rapidez"
      : dateMention
        ? `Tiene fecha: ${dateMention[0]}`
        : "",
    objections: rejection
      ? "Ha rechazado la compra"
      : hesitation
        ? "Duda / se lo piensa"
        : has("caro")
          ? "Le parece caro"
          : asksReturns
            ? "Pregunta por devoluciones antes de comprar"
            : "",
  };

  // --- Texto de "qué quiere" ------------------------------------
  const desiredParts = [
    quantity > 1 ? `${quantity}×` : "",
    product || (allText ? "producto sin identificar" : ""),
    size ? `talla ${size}` : "",
    color ? `color ${color}` : "",
  ].filter(Boolean);
  const desired = desiredParts.join(" ").trim();

  // --- Pregunta principal (para resumen / borrador) -------------
  const mainQuestion = asksPayment
    ? "cómo pagar"
    : asksShipping
      ? "el envío"
      : asksPrice
        ? "el precio"
        : asksStock
          ? "la disponibilidad"
          : asksSizing
            ? "las tallas"
            : asksReturns
              ? "las devoluciones"
              : "información general";

  // --- Resumen -------------------------------------------------
  const summary =
    inbound.length === 0
      ? "Sin mensajes del cliente todavía."
      : `${input.contactName} escribe por ${input.channel}${
          product ? ` interesándose por ${product.toLowerCase()}` : ""
        }${size || color ? ` (${[size && `talla ${size}`, color].filter(Boolean).join(", ")})` : ""}. ` +
        `Pregunta por ${mainQuestion}. Interés estimado ${score}/100.`;

  // --- Siguiente paso ----------------------------------------
  const prod = product ? product.toLowerCase() : "el producto";
  const variant = [size && `talla ${size}`, color].filter(Boolean).join(", ");
  const nextStep = {
    NUEVO: `Preguntar qué ${product ? prod : "artículo"} busca (modelo, talla, color) y ofrecer ayuda.`,
    INTERESADO: `Enviar precio y disponibilidad de ${prod}. Pedir talla y color para poder cerrar.`,
    EN_PROCESO_DE_COMPRA: `Confirmar ${prod}${variant ? ` (${variant})` : ""}, pedir dirección de envío y mandar el enlace de pago.`,
    CLIENTE: "Confirmar que el pedido va en camino y ofrecer productos que combinen.",
    PERDIDO: "Anotar el motivo y guardar el contacto para una campaña de recuperación.",
  }[stage];

  // --- Borrador de respuesta --------------------------------
  const name = input.contactName;
  let draftReply: string;
  if (stage === "PERDIDO") {
    draftReply = `Gracias por decírmelo, ${name}. Si cambias de idea o quieres que te avise cuando haya ofertas de ${prod}, aquí estoy. 😊`;
  } else if (stage === "CLIENTE") {
    draftReply = `¡Gracias por tu compra, ${name}! En cuanto salga te paso el seguimiento. Si necesitas algo más con ${prod}, dímelo.`;
  } else if (stage === "EN_PROCESO_DE_COMPRA") {
    draftReply =
      `¡Hola ${name}! Genial 🙌 Te preparo el pedido${product ? ` de ${prod}` : ""}${
        variant ? ` (${variant})` : ""
      }. ¿Me confirmas la dirección de envío? Te paso el enlace de pago y, si lo confirmas hoy, lo enviamos hoy mismo.`;
  } else if (asksShipping) {
    draftReply = `¡Hola ${name}! Te confirmo plazos y gastos de envío ahora mismo. ¿Quieres que te reserve ${prod}${
      variant ? ` (${variant})` : ""
    } mientras tanto?`;
  } else if (asksPrice || asksStock || asksSizing) {
    draftReply = `¡Hola ${name}! Ahora te digo ${
      asksPrice ? "el precio y la disponibilidad" : "la disponibilidad"
    } de ${prod}.${size || color ? "" : " ¿Qué talla y color necesitas?"} Así te lo confirmo al momento.`;
  } else {
    draftReply = `¡Hola ${name}! Gracias por escribirnos. Cuéntame qué ${
      product ? prod : "artículo"
    } buscas (modelo, talla o color) y te digo precio y disponibilidad enseguida.`;
  }

  return {
    stage,
    interestScore: score,
    desired,
    sentiment,
    signals,
    summary,
    nextStep,
    draftReply,
  };
}
