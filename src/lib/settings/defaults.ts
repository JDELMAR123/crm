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

/**
 * Toda instalación NUEVA arranca con el cobro de licencia activado (aunque
 * sin precio ni instrucciones todavía) — así un despliegue que nadie
 * configuró a tiempo no se queda abierto y gratis por descuido. El creador
 * lo desactiva explícitamente en /creador si esa instalación en concreto no
 * debe cobrar (p. ej. su propia instancia de referencia).
 */
export const DEFAULT_LICENSE_ENABLED = true;

/** Mensaje que ve el comprador si el creador todavía no puso instrucciones de pago. */
export const DEFAULT_LICENSE_INSTRUCTIONS =
  "Contacta a quien te vendió este CRM para completar el pago y recibir tu clave de licencia.";
