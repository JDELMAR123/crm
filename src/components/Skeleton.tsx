/** Bloque de carga genérico (server component, sin JS). */
export function SkeletonPanel() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="space-y-2">
        <div className="h-6 w-48 rounded bg-black/10 dark:bg-white/10" />
        <div className="h-4 w-72 rounded bg-black/5 dark:bg-white/5" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 rounded-lg border border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
          />
        ))}
      </div>
      <div className="space-y-2 rounded-lg border border-black/10 p-2 dark:border-white/10">
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 rounded bg-black/5 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}

/** Carga para el panel de una conversación (hilo + análisis de IA). */
export function SkeletonConversation() {
  return (
    <div className="grid h-full animate-pulse md:grid-cols-[1fr_260px]">
      <div className="space-y-2 p-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-10 max-w-[70%] rounded-lg bg-black/5 dark:bg-white/5 ${
              i % 2 ? "ml-auto" : ""
            }`}
          />
        ))}
      </div>
      <div className="space-y-3 border-t border-black/10 p-4 md:border-l md:border-t-0 dark:border-white/10">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-4 rounded bg-black/5 dark:bg-white/5" />
        ))}
      </div>
    </div>
  );
}
