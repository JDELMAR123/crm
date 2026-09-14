"use client";

import { useActionState } from "react";
import { saveModules, saveNotice, type CreatorState } from "@/lib/actions/creator";

const MODULES: { id: "inbox" | "pipeline" | "ia"; label: string; desc: string }[] = [
  { id: "inbox", label: "Bandeja de entrada", desc: "Conversaciones de WhatsApp e Instagram" },
  { id: "pipeline", label: "Pipeline", desc: "Tablero Kanban de clientes por etapa" },
  { id: "ia", label: "Sectorización con IA", desc: "Análisis automático de cada conversación" },
];

function Status({ state }: { state: CreatorState }) {
  if (state.ok) return <span className="hk-status-msg ok">guardado [ok]</span>;
  if (state.error) return <span className="hk-status-msg error">error: {state.error}</span>;
  return null;
}

export function ModulesForm({ disabled }: { disabled: string[] }) {
  const [state, action, pending] = useActionState(saveModules, {});
  return (
    <form action={action} className="hk-section">
      <h2 className="hk-section-title">Módulos activos</h2>
      <p className="hk-section-hint">Desactiva un módulo para ocultarlo en esta instalación.</p>
      {MODULES.map((m) => (
        <label key={m.id} className="hk-check-row">
          <input type="checkbox" name={`mod_${m.id}`} defaultChecked={!disabled.includes(m.id)} />
          <span>
            {m.label}
            <span className="hk-check-desc">{m.desc}</span>
          </span>
        </label>
      ))}
      <div className="mt-3 flex items-center gap-3">
        <button disabled={pending} className="hk-btn">
          {pending ? "guardando…" : "guardar"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}

export function NoticeForm({ notice }: { notice: string | null }) {
  const [state, action, pending] = useActionState(saveNotice, {});
  return (
    <form action={action} className="hk-section">
      <h2 className="hk-section-title">Aviso a los usuarios</h2>
      <p className="hk-section-hint">
        Aparece como banner dentro del CRM para todo el equipo. Vacío = sin aviso.
      </p>
      <textarea
        name="creatorNotice"
        defaultValue={notice ?? ""}
        rows={3}
        placeholder="Ej.: Mantenimiento programado el domingo a las 22:00."
        className="hk-textarea"
      />
      <div className="mt-3 flex items-center gap-3">
        <button disabled={pending} className="hk-btn">
          {pending ? "guardando…" : "guardar"}
        </button>
        <Status state={state} />
      </div>
    </form>
  );
}
