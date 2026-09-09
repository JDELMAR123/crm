/** Valores por defecto de la configuración. Se usan al crear la fila de ajustes. */

export const DEFAULT_BUSINESS_NAME = "Mi CRM";

/** Modelo de la IA avanzada. */
export const DEFAULT_AI_MODEL = "claude-opus-5";

export const DEFAULT_BUSINESS_CONTEXT = `
Somos una tienda de productos físicos (e-commerce).
Los clientes escriben por WhatsApp e Instagram para preguntar por:
- disponibilidad de stock, tallas, colores y variantes
- precios, descuentos y promociones
- gastos y plazos de envío, seguimiento de pedidos
- devoluciones y cambios

Objetivo: identificar qué producto quiere el cliente, su nivel de interés y
en qué punto del proceso de compra está, para priorizar la atención.
`.trim();

export type CatalogEntry = { name: string; keywords: string[] };

export const DEFAULT_PRODUCT_CATALOG: CatalogEntry[] = [
  { name: "Camisetas", keywords: ["camiseta", "camisetas", "playera", "remera"] },
  { name: "Sudaderas", keywords: ["sudadera", "sudaderas", "hoodie", "capucha"] },
  { name: "Zapatillas", keywords: ["zapatilla", "zapatillas", "tenis", "sneakers", "deportivas", "bambas"] },
  { name: "Pantalones", keywords: ["pantalon", "pantalones", "vaquero", "vaqueros", "jeans"] },
  { name: "Vestidos", keywords: ["vestido", "vestidos"] },
  { name: "Chaquetas", keywords: ["chaqueta", "chaquetas", "cazadora", "abrigo", "abrigos"] },
  { name: "Bolsos", keywords: ["bolso", "bolsos", "mochila", "mochilas", "bandolera", "riñonera"] },
  { name: "Accesorios", keywords: ["gorra", "gorras", "cinturon", "bufanda", "reloj", "gafas", "calcetines"] },
];

export const DEFAULT_COLOR_WORDS = [
  "negro", "blanco", "gris", "azul", "rojo", "verde", "amarillo", "rosa",
  "morado", "naranja", "marron", "beige", "granate", "celeste", "turquesa",
];
