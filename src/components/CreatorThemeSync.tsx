"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Activa/desactiva el tema hacker en <body> según la URL actual, en vez de
 * depender de que /creador se "monte" de cero cada vez — con las
 * animaciones de transición entre paneles (PageTransition) y la caché de
 * navegación de Next, eso no siempre pasaba de forma limpia y el tema se
 * quedaba pegado en un estado a medias. Enganchado a usePathname(), se
 * re-sincroniza en cada cambio de URL, entres como entres.
 */
export default function CreatorThemeSync() {
  const pathname = usePathname();
  const active = pathname === "/creador" || pathname.startsWith("/creador/");

  useEffect(() => {
    document.body.classList.toggle("hacker-active", active);
  }, [active]);

  return null;
}
