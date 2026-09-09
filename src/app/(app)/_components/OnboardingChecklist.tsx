import Link from "next/link";

export type OnboardingStep = {
  label: string;
  href: string;
  done: boolean;
};

export default function OnboardingChecklist({ steps }: { steps: OnboardingStep[] }) {
  const pending = steps.filter((s) => !s.done).length;
  if (pending === 0) return null;

  return (
    <div className="space-y-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-5">
      <div>
        <h2 className="font-medium">Primeros pasos</h2>
        <p className="text-sm opacity-70">
          Te quedan {pending} de {steps.length} para dejar el CRM a tu medida.
        </p>
      </div>
      <ul className="space-y-2">
        {steps.map((s) => (
          <li key={s.label} className="flex items-center gap-3 text-sm">
            <span
              className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border text-xs ${
                s.done
                  ? "border-green-600 bg-green-600 text-white"
                  : "border-black/25 dark:border-white/30"
              }`}
            >
              {s.done ? "✓" : ""}
            </span>
            {s.done ? (
              <span className="opacity-50 line-through">{s.label}</span>
            ) : (
              <Link href={s.href} className="hover:underline">
                {s.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
