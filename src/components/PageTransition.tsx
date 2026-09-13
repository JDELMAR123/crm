"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

/**
 * Transición deslizante entre páginas. Envuelve el contenido de cada ruta;
 * al cambiar de panel (Bandeja, Pipeline, Contactos…) la vista anterior se
 * desliza hacia un lado mientras la nueva entra desde el otro.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Anima al cambiar de panel (Bandeja, Pipeline, Contactos…), no al navegar
  // dentro de uno (p. ej. entre conversaciones de la bandeja).
  const section = pathname.split("/").filter(Boolean)[0] ?? "inicio";

  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={section}
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -24 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
