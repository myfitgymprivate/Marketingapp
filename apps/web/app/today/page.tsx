import Link from "next/link";

import { AppShell, PageHeader } from "../_components/app-shell";
import { TaskCompleteButton } from "../_components/task-complete-button";
import { storyFrames } from "../_lib/demo-data";

const weekItems = [
  { day: "Po", type: "Story", state: "published" },
  { day: "St", type: "Story", state: "today" },
  { day: "Pá", type: "Reel", state: "planned" },
  { day: "Ne", type: "Story", state: "planned" },
];

function formatToday() {
  const formatted = new Intl.DateTimeFormat("cs-CZ", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/Prague",
  }).format(new Date());

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

export default function TodayPage() {
  return (
    <AppShell active="today">
      <PageHeader eyebrow="Co dnes musím udělat?" title={formatToday()} />

      <div className="welcome-card">
        <div>
          <p className="eyebrow light">AI marketingový manažer</p>
          <h2>Dnes to zvládneme za 10 minut.</h2>
          <p>
            Jedna důležitá kontrola, připravená Story a žádné zbytečné
            rozhodování.
          </p>
        </div>
        <div
          className="health-score"
          aria-label="Marketingové zdraví 82 procent"
        >
          <strong>82</strong>
          <span>Marketing Health</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel priority-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow danger">Denní priorita</p>
              <h2>Vstupy zdarma za úrovně</h2>
            </div>
            <span className="alert-badge">3 dny</span>
          </div>
          <p className="muted">
            Je to jedna kumulovaná kontrola, ne tři staré úkoly. Po dokončení se
            další termín nastaví na zítřek.
          </p>
          <TaskCompleteButton />
        </section>

        <section className="panel content-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow accent">Dnešní marketing</p>
              <h2>Soukromí bez čekání</h2>
            </div>
            <span className="type-badge">Story · 3 obrazovky</span>
          </div>
          <p className="muted">Téma týdne: Cvičení ve dvou · Cíl: Akvizice</p>
          <div className="story-preview" aria-label="Náhled Story série">
            {storyFrames.map((frame) => (
              <div key={frame.position}>
                <span>{frame.position}</span> {frame.text}
              </div>
            ))}
          </div>
          <div className="button-row wrap-buttons">
            <Link
              className="primary-button link-button"
              href="/content/story-soukromi"
            >
              Otevřít podklady
            </Link>
            <Link
              className="secondary-button link-button"
              href="/ai?intent=change-content"
            >
              Změnit obsah
            </Link>
            <Link className="secondary-button link-button" href="/calendar">
              Přesunout
            </Link>
          </div>
        </section>

        <section className="panel week-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Stav týdne</p>
              <h2>Jedno téma, čtyři výstupy</h2>
            </div>
            <span className="week-score">2 / 4</span>
          </div>
          <div className="week-flow">
            {weekItems.map((item) => (
              <div className={`week-item ${item.state}`} key={item.day}>
                <span>{item.day}</span>
                <strong>{item.type}</strong>
              </div>
            ))}
          </div>
          <Link className="text-link" href="/calendar">
            Zobrazit celý plán →
          </Link>
        </section>

        <section className="panel compact-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Další úkoly</p>
              <h2>Co ještě hlídat</h2>
            </div>
            <span className="type-badge">2 otevřené</span>
          </div>
          <ul className="clean-list">
            <li>
              <span>○</span>
              <div>
                <strong>Připravit záběry pro páteční Reel</strong>
                <small>Termín zítra</small>
              </div>
            </li>
            <li>
              <span>○</span>
              <div>
                <strong>Potvrdit zářijový měsíční plán</strong>
                <small>Do 25. srpna</small>
              </div>
            </li>
          </ul>
          <Link className="text-link" href="/tasks">
            Všechny úkoly →
          </Link>
        </section>

        <section className="panel notification-panel">
          <div className="notification-icon">!</div>
          <div>
            <p className="eyebrow accent">Upozornění</p>
            <h2>Plán na září čeká na schválení</h2>
            <p className="muted">
              AI připravila návrh 1 Reel/Post týdně a Story obden.
            </p>
          </div>
          <Link
            className="secondary-button link-button"
            href="/calendar#monthly-plan"
          >
            Zkontrolovat
          </Link>
        </section>

        <section className="panel ai-panel">
          <div className="sparkle">✦</div>
          <div>
            <p className="eyebrow light">MyFit AI</p>
            <h2>Napiš mi, co se změnilo.</h2>
            <p>
              Uprav dnešní plán, zapiš publikovaný obsah nebo ulož nový nápad.
            </p>
          </div>
          <Link className="ai-button link-button" href="/ai">
            Otevřít chat →
          </Link>
        </section>
      </div>
    </AppShell>
  );
}
