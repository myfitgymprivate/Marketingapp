"use client";

import { useState } from "react";

type Module = {
  title: string;
  description: string;
  icon: string;
  status: string;
};

const moduleDetails: Record<string, string> = {
  "Marketing Brain":
    "Zde budou ověřená fakta o MyFit, zakázaná tvrzení, tón komunikace a cílové skupiny.",
  "Idea Bank":
    "Nápady uložené agentem zůstávají bez termínu, dokud je nezařadíš do plánu.",
  "Trend Radar":
    "Trend se použije jen tehdy, když má zdroj, datum a jasný přínos pro MyFit.",
  Kampaně:
    "Každá sleva nebo finanční nabídka vyžaduje samostatné potvrzení majitelky.",
  "AI Visual":
    "Grafiku už můžeš vytvořit v detailu obsahu Soukromí bez čekání.",
  "Marketing Memory":
    "Paměť používá jen potvrzené publikování a dokončené akce.",
};

export function ModuleGrid({ modules }: { modules: readonly Module[] }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className="module-grid">
      {modules.map((module) => (
        <article className="panel module-card" key={module.title}>
          <div className="module-icon">{module.icon}</div>
          <div>
            <p className="eyebrow accent">{module.status}</p>
            <h2>{module.title}</h2>
            <p className="muted">{module.description}</p>
            {open === module.title ? (
              <p className="module-detail">{moduleDetails[module.title]}</p>
            ) : null}
          </div>
          <button
            className="secondary-button"
            onClick={() =>
              setOpen((current) =>
                current === module.title ? null : module.title,
              )
            }
            type="button"
          >
            {open === module.title ? "Zavřít" : "Otevřít modul"}
          </button>
        </article>
      ))}
    </div>
  );
}
