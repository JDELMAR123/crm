"use client";

import { useEffect } from "react";

/**
 * Activa el tema hacker a nivel de TODA la página (incluido el menú de
 * arriba, que vive fuera de esta sección) mientras estás dentro de
 * /creador, y lo quita al salir. Vive en el layout de /creador, así que
 * Next lo monta/desmonta exactamente al entrar/salir de esta sección.
 */
export default function HackerBodyEffect({ fontVariable }: { fontVariable: string }) {
  useEffect(() => {
    const classes = ["hacker-active", fontVariable];
    document.body.classList.add(...classes);
    return () => {
      document.body.classList.remove(...classes);
    };
  }, [fontVariable]);

  return <div className="hk-scan-overlay" aria-hidden="true" />;
}
