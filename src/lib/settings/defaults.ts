/** Valores por defecto de la configuración. Se usan al crear la fila de ajustes. */

export const DEFAULT_BUSINESS_NAME = "Mi CRM";

/** Modelo de la IA avanzada. */
export const DEFAULT_AI_MODEL = "claude-opus-5";

export const DEFAULT_BUSINESS_CONTEXT = `
Los clientes escriben por WhatsApp e Instagram para preguntar por nuestros
productos o servicios: disponibilidad, precios, promociones, plazos y
condiciones, o para resolver dudas antes o después de comprar.

Objetivo: identificar qué producto o servicio quiere el cliente (según el
catálogo configurado), su nivel de interés y en qué punto del proceso de
compra está, para priorizar la atención.
`.trim();

export const DEFAULT_COLOR_WORDS = [
  "negro", "blanco", "gris", "azul", "rojo", "verde", "amarillo", "rosa",
  "morado", "naranja", "marron", "beige", "granate", "celeste", "turquesa",
];
