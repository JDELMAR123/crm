"use client";

import { useState } from "react";

export default function AiProviderChoice({
  defaultValue,
}: {
  defaultValue: "simulation" | "anthropic";
}) {
  const [value, setValue] = useState(defaultValue);

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">Motor de análisis</span>
      <div className="space-y-2">
        {(
          [
            {
              v: "simulation" as const,
              t: "IA básica (incluida, gratis)",
              d: "Análisis por palabras clave. Sin coste ni cuentas externas.",
            },
            {
              v: "anthropic" as const,
              t: "IA avanzada",
              d: "Entiende la conversación de verdad. Requiere una clave de API (coste por uso). Ver la guía de configuración.",
            },
          ]
        ).map((o) => (
          <label
            key={o.v}
            className={`flex cursor-pointer gap-3 rounded-md border p-3 text-sm ${
              value === o.v
                ? "border-foreground"
                : "border-black/15 dark:border-white/20"
            }`}
          >
            <input
              type="radio"
              name="aiProvider"
              value={o.v}
              checked={value === o.v}
              onChange={() => setValue(o.v)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">{o.t}</span>
              <span className="block opacity-60">{o.d}</span>
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
