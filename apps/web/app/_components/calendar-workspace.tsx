"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useEffect, useMemo, useState } from "react";

import { calendarItems } from "../_lib/demo-data";
import {
  createCalendarGraphic,
  getCalendarVisual,
  saveCalendarVisual,
  type CalendarContentKit,
  type SavedCalendarVisual,
} from "../_lib/calendar-visual";
import {
  myfitVisualTemplates,
  type MyfitStoryComposition,
  type MyfitVisualTemplate,
} from "../_lib/myfit-visual-system";

type CalendarItem = {
  id: string;
  date: string;
  type: string;
  title: string;
  state: string;
};

type ContentKitResponse = {
  data?: { mode: "live" | "demo"; kit: CalendarContentKit };
  error?: { message: string };
};

type VisualResponse = {
  data?: {
    mode: "live" | "demo";
    imageDataUrl: string | null;
    template: MyfitVisualTemplate;
    composition: MyfitStoryComposition;
  };
  error?: { message: string };
};

type VisualMeta = Record<
  string,
  { generatedAt: string; mode: "live" | "demo" }
>;

type AgentMessage = { role: "user" | "assistant"; text: string };

const STORAGE_KEY = "myfit-calendar-items-v2";
const VISUAL_META_KEY = "myfit-calendar-visual-meta";
const weekdays = ["Po", "Út", "St", "Čt", "Pá", "So", "Ne"];
const filters = ["Vše", "Story", "Reel", "Post", "Úkoly"];

const augustItems: CalendarItem[] = calendarItems.map((item, index) => ({
  id: `august-${index + 1}`,
  date: `2026-08-${String(item.day).padStart(2, "0")}`,
  type: item.type,
  title: item.title,
  state: item.state,
}));

const septemberDraft: CalendarItem[] = [
  {
    id: "september-story-opening",
    date: "2026-09-02",
    type: "STORY",
    title: "Návrat do rytmu · úvodní série",
    state: "draft",
  },
  {
    id: "september-task-photo",
    date: "2026-09-04",
    type: "ÚKOL",
    title: "Vybrat fotografie pro zářijový obsah",
    state: "draft",
  },
  {
    id: "september-reel-training",
    date: "2026-09-08",
    type: "REEL",
    title: "Krátký návratový trénink",
    state: "draft",
  },
  {
    id: "september-story-privacy",
    date: "2026-09-13",
    type: "STORY",
    title: "Zpátky v tempu, stále v soukromí",
    state: "draft",
  },
  {
    id: "september-task-reel",
    date: "2026-09-15",
    type: "ÚKOL",
    title: "Natočit záběry pro Reel",
    state: "draft",
  },
  {
    id: "september-post-rhythm",
    date: "2026-09-18",
    type: "POST",
    title: "Vrať se ke svému tempu",
    state: "draft",
  },
  {
    id: "september-story-booking",
    date: "2026-09-24",
    type: "STORY",
    title: "Vyber si svůj čas · rezervační série",
    state: "draft",
  },
  {
    id: "september-task-check",
    date: "2026-09-27",
    type: "ÚKOL",
    title: "Zkontrolovat rytmus a výsledky měsíce",
    state: "draft",
  },
];

const defaultItems = [...augustItems, ...septemberDraft];

function toIsoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function monthLabel(month: string) {
  const [yearText = "2026", monthText = "01"] = month.split("-");
  const year = Number(yearText);
  const monthNumber = Number(monthText);
  const label = new Intl.DateTimeFormat("cs-CZ", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, monthNumber - 1, 1));
  return label.charAt(0).toLocaleUpperCase("cs-CZ") + label.slice(1);
}

function contentCopy(item: CalendarItem) {
  if (item.type === "REEL")
    return {
      message: "Krátký a snadno natočitelný Reel s jasným úvodem.",
      cta: "Vyber si svůj termín",
      format: "Scénář · shotlist · caption",
    };
  if (item.type === "POST")
    return {
      message: "Klidný prémiový příspěvek navázaný na téma měsíce.",
      cta: "Rezervovat termín",
      format: "Grafika 4:5 · caption · CTA",
    };
  return {
    message: "Krátká Story série s jedním hlavním sdělením a výzvou.",
    cta: "Rezervovat termín",
    format: "Story 9:16 · texty · vizuální pokyny",
  };
}

function defaultContentKit(item: CalendarItem): CalendarContentKit {
  const copy = contentCopy(item);
  return {
    headline: item.title,
    message: copy.message,
    caption: `${item.title}. V MyFit máš prostor jen pro sebe a můžeš se soustředit na svůj trénink.`,
    cta: copy.cta,
    theme: `${item.title}; soukromé fitness, klid a vlastní tempo`,
    visualDirection:
      item.type === "POST"
        ? "Tmavá filmová fotografie MyFit, hluboká černá, krémová a tlumená zlatá."
        : "Teplá reálná fotografie MyFit, krémový prostor, tlumená zlatá a klidná prémiová kompozice.",
    textVariants: [
      {
        id: "short",
        label: "Stručná",
        headline: item.title,
        message: "Vlastní tempo. Vlastní prostor. Bez čekání.",
        caption: `${item.title}. Dopřej si trénink v klidu a soukromí.`,
        cta: copy.cta,
      },
      {
        id: "premium",
        label: "Prémiová",
        headline: item.title,
        message: copy.message,
        caption: `${item.title}. Soukromý prostor, klid a čas věnovaný jen sobě.`,
        cta: copy.cta,
      },
      {
        id: "personal",
        label: "Osobnější",
        headline: "Čas jen pro tebe",
        message: "Zacvič si. Vyčisti hlavu. Nabij tělo.",
        caption: `Někdy stačí mít chvíli jen pro sebe. ${item.title} v MyFit znamená klid a žádné čekání.`,
        cta: "Vybrat svůj čas",
      },
    ],
  };
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("cs-CZ", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

function readinessFor(item: CalendarItem, visualReady: boolean) {
  if (visualReady)
    return { state: "ready", label: "Grafika připravená", detail: "✓" };
  const publishingDate = new Date(`${item.date}T12:00:00`);
  const preparationDate = new Date(publishingDate);
  preparationDate.setDate(preparationDate.getDate() - 7);
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  if (today >= publishingDate)
    return {
      state: "late",
      label: "Grafika chybí",
      detail: "Připravit nyní",
    };
  if (today >= preparationDate)
    return {
      state: "due",
      label: "Je čas připravit grafiku",
      detail: "Do publikace zbývá nejvýše 7 dní",
    };
  return {
    state: "scheduled",
    label: `Příprava od ${formatDate(toIsoDate(preparationDate))}`,
    detail: "Vygenerovat lze i dříve",
  };
}

export function CalendarWorkspace() {
  const [items, setItems] = useState<CalendarItem[]>(defaultItems);
  const [viewMonth, setViewMonth] = useState("2026-08");
  const [filter, setFilter] = useState("Vše");
  const [formOpen, setFormOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState("STORY");
  const [date, setDate] = useState("2026-08-13");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editType, setEditType] = useState("STORY");
  const [editDate, setEditDate] = useState("");
  const [approved, setApproved] = useState(false);
  const [notice, setNotice] = useState("");
  const [visualMeta, setVisualMeta] = useState<VisualMeta>({});
  const [activeVisual, setActiveVisual] = useState<SavedCalendarVisual | null>(
    null,
  );
  const [contentKit, setContentKit] = useState<CalendarContentKit | null>(null);
  const [kitMode, setKitMode] = useState<"live" | "demo" | null>(null);
  const [selectedVariantId, setSelectedVariantId] = useState("premium");
  const [agentSteps, setAgentSteps] = useState<string[]>([]);
  const [visualBusy, setVisualBusy] = useState(false);
  const [eventAgentMessage, setEventAgentMessage] = useState("");
  const [eventAgentBusy, setEventAgentBusy] = useState(false);
  const [eventAgentEntries, setEventAgentEntries] = useState<AgentMessage[]>(
    [],
  );

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      const rescheduled = window.localStorage.getItem(
        "myfit-calendar-reschedule-reel",
      );
      let nextItems = saved
        ? (JSON.parse(saved) as CalendarItem[])
        : defaultItems;
      if (rescheduled) {
        nextItems = nextItems.map((item) =>
          item.title.includes("5 důvodů")
            ? {
                ...item,
                date: `2026-08-${String(rescheduled).padStart(2, "0")}`,
              }
            : item,
        );
      }
      setItems(nextItems);
      setApproved(
        window.localStorage.getItem("myfit-september-plan") === "approved",
      );
      const savedVisualMeta = window.localStorage.getItem(VISUAL_META_KEY);
      if (savedVisualMeta)
        setVisualMeta(JSON.parse(savedVisualMeta) as VisualMeta);
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  const calendarDays = useMemo(() => {
    const [yearText = "2026", monthText = "01"] = viewMonth.split("-");
    const year = Number(yearText);
    const monthNumber = Number(monthText);
    const firstDay = new Date(year, monthNumber - 1, 1);
    const mondayOffset = (firstDay.getDay() + 6) % 7;
    return Array.from({ length: 42 }, (_, index) => {
      const value = new Date(year, monthNumber - 1, index - mondayOffset + 1);
      return {
        date: toIsoDate(value),
        day: value.getDate(),
        outside: value.getMonth() !== monthNumber - 1,
      };
    });
  }, [viewMonth]);

  const visibleItems = useMemo(() => {
    if (filter === "Vše") return items;
    const normalizedFilter = filter === "Úkoly" ? "ÚKOL" : filter.toUpperCase();
    return items.filter((item) => item.type === normalizedFilter);
  }, [filter, items]);

  const editingItem = items.find((item) => item.id === editingId);
  const editingContent = editingItem ? contentCopy(editingItem) : null;
  const selectedTextVariant =
    contentKit?.textVariants.find(
      (variant) => variant.id === selectedVariantId,
    ) ?? contentKit?.textVariants[0];
  const editingReadiness = editingItem
    ? readinessFor(editingItem, Boolean(visualMeta[editingItem.id]))
    : null;

  function persistItems(nextItems: CalendarItem[]) {
    setItems(nextItems);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextItems));
  }

  function changeMonth(offset: number) {
    const [yearText = "2026", monthText = "01"] = viewMonth.split("-");
    const year = Number(yearText);
    const monthNumber = Number(monthText);
    const next = new Date(year, monthNumber - 1 + offset, 1);
    const nextMonth = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`;
    setViewMonth(nextMonth);
    setDate(`${nextMonth}-01`);
  }

  function addItem() {
    if (!title.trim()) return;
    const nextItems = [
      ...items,
      {
        id: crypto.randomUUID(),
        date,
        type,
        title: title.trim(),
        state: "draft",
      },
    ];
    persistItems(nextItems);
    setTitle("");
    setFormOpen(false);
    setViewMonth(date.slice(0, 7));
    setNotice("Obsah byl přidán do kalendáře.");
  }

  async function openEditor(item: CalendarItem) {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditType(item.type);
    setEditDate(item.date);
    setSelectedVariantId("premium");
    setAgentSteps([]);
    setEventAgentMessage("");
    setEventAgentEntries([
      {
        role: "assistant",
        text: `Pracuji jen s událostí „${item.title}“. Můžeme upravit text, tón, CTA, vizuální směr nebo vytvořit novou grafiku.`,
      },
    ]);
    if (item.type === "ÚKOL") {
      setContentKit(null);
      setActiveVisual(null);
      return;
    }
    const immediateKit = defaultContentKit(item);
    setContentKit(immediateKit);
    setKitMode(null);
    setActiveVisual(null);
    try {
      const savedVisual = await getCalendarVisual(item.id);
      if (savedVisual) {
        setActiveVisual(savedVisual);
        setContentKit(savedVisual.kit);
        setKitMode(savedVisual.mode);
      }
    } catch {
      setNotice("Uložený náhled grafiky se nepodařilo načíst.");
    }
  }

  async function prepareContentKit(item: CalendarItem, instruction?: string) {
    const response = await fetch("/api/v1/ai/content-kit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: item.id,
        title: item.title,
        type: item.type,
        date: item.date,
        instruction,
      }),
    });
    const result = (await response.json()) as ContentKitResponse;
    if (!response.ok || !result.data)
      throw new Error(result.error?.message ?? "Agent podklady nepřipravil.");
    setContentKit(result.data.kit);
    setKitMode(result.data.mode);
    return result.data;
  }

  async function generateVisual() {
    if (!editingItem || editingItem.type === "ÚKOL" || !contentKit) return;
    setVisualBusy(true);
    setAgentSteps(["Obsahový agent analyzuje cíl události…"]);
    try {
      let activeKit = contentKit;
      if (!kitMode) {
        const prepared = await prepareContentKit(
          editingItem,
          `Připrav podklady v tónu varianty ${selectedVariantId}.`,
        );
        activeKit = prepared.kit;
      }
      const selectedVariant =
        activeKit.textVariants.find(
          (variant) => variant.id === selectedVariantId,
        ) ?? activeKit.textVariants[0];
      if (!selectedVariant) throw new Error("Chybí textová varianta.");
      const finalKit: CalendarContentKit = {
        ...activeKit,
        headline: selectedVariant.headline,
        message: selectedVariant.message,
        caption: selectedVariant.caption,
        cta: selectedVariant.cta,
      };
      setAgentSteps((current) => [
        ...current,
        `Text hotový · ${selectedVariant.label}`,
        "Brand agent kontroluje barvy, tón a kompozici MyFit…",
      ]);
      const isPost = editingItem.type === "POST";
      const template: MyfitVisualTemplate = isPost
        ? "post_announcement"
        : "story_private_benefit";
      const composition: MyfitStoryComposition = activeVisual
        ? "photo_forward"
        : "editorial_split";
      const visualResponse = await fetch("/api/v1/ai/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline: finalKit.headline,
          theme: `${finalKit.theme}. ${finalKit.visualDirection}`,
          format: isPost ? "post" : "story",
          template,
          composition,
        }),
      });
      const visualResult = (await visualResponse.json()) as VisualResponse;
      if (!visualResponse.ok || !visualResult.data)
        throw new Error(
          visualResult.error?.message ?? "Grafický agent nedokončil návrh.",
        );
      setAgentSteps((current) => [
        ...current,
        "Grafický agent vytváří fotografický podklad…",
      ]);
      const background =
        visualResult.data.imageDataUrl ??
        myfitVisualTemplates[visualResult.data.template].backgroundAsset;
      const dataUrl = await createCalendarGraphic(
        editingItem.type,
        finalKit,
        background,
      );
      const savedVisual: SavedCalendarVisual = {
        itemId: editingItem.id,
        dataUrl,
        generatedAt: new Date().toISOString(),
        mode: visualResult.data.mode,
        kit: finalKit,
      };
      await saveCalendarVisual(savedVisual);
      setActiveVisual(savedVisual);
      setContentKit(finalKit);
      const nextMeta = {
        ...visualMeta,
        [editingItem.id]: {
          generatedAt: savedVisual.generatedAt,
          mode: savedVisual.mode,
        },
      };
      setVisualMeta(nextMeta);
      window.localStorage.setItem(VISUAL_META_KEY, JSON.stringify(nextMeta));
      setAgentSteps((current) => [
        ...current,
        "Grafika složená a uložená ke konkrétní události ✓",
      ]);
      setNotice("AI agent připravil text i grafiku a uložil je ke kalendáři.");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Agent návrh nedokončil.";
      setAgentSteps((current) => [...current, `Nedokončeno: ${message}`]);
      setNotice(message);
    } finally {
      setVisualBusy(false);
    }
  }

  async function sendEventAgentMessage() {
    if (!editingItem || !eventAgentMessage.trim() || eventAgentBusy) return;
    const message = eventAgentMessage.trim();
    setEventAgentMessage("");
    setEventAgentEntries((current) => [
      ...current,
      { role: "user", text: message },
    ]);
    setEventAgentBusy(true);
    try {
      const prepared = await prepareContentKit(editingItem, message);
      setSelectedVariantId("premium");
      setEventAgentEntries((current) => [
        ...current,
        {
          role: "assistant",
          text: `Připravila jsem tři nové textové varianty a upravila vizuální směr. Vyber text níže; grafiku vytvořím až po stisknutí tlačítka, aby nevznikal zbytečný náklad. Režim: ${prepared.mode === "live" ? "živá AI" : "demo"}.`,
        },
      ]);
    } catch (error) {
      setEventAgentEntries((current) => [
        ...current,
        {
          role: "assistant",
          text:
            error instanceof Error
              ? error.message
              : "Úpravu se nepodařilo připravit.",
        },
      ]);
    } finally {
      setEventAgentBusy(false);
    }
  }

  function saveEditedItem() {
    if (!editingItem || !editTitle.trim() || !editDate) return;
    persistItems(
      items.map((item) =>
        item.id === editingItem.id
          ? {
              ...item,
              title: editTitle.trim(),
              type: editType,
              date: editDate,
            }
          : item,
      ),
    );
    setEditingId(null);
    setViewMonth(editDate.slice(0, 7));
    setNotice("Událost byla upravena.");
  }

  function moveItem(itemId: string, targetDate: string) {
    const movedItem = items.find((item) => item.id === itemId);
    if (!movedItem || movedItem.date === targetDate) return;
    persistItems(
      items.map((item) =>
        item.id === itemId ? { ...item, date: targetDate } : item,
      ),
    );
    setNotice(`„${movedItem.title}“ přesunuto na ${targetDate}.`);
  }

  function approvePlan() {
    setApproved(true);
    window.localStorage.setItem("myfit-september-plan", "approved");
    persistItems(
      items.map((item) =>
        item.date.startsWith("2026-09") && item.state === "draft"
          ? { ...item, state: "planned" }
          : item,
      ),
    );
    setNotice("Zářijový plán je schválený a položky jsou naplánované.");
  }

  return (
    <>
      <div className="calendar-toolbar">
        <div className="month-navigation" aria-label="Přepínání měsíců">
          <button
            aria-label="Předchozí měsíc"
            className="month-button"
            onClick={() => changeMonth(-1)}
            type="button"
          >
            ←
          </button>
          <div>
            <p className="eyebrow accent">Zobrazený měsíc</p>
            <h2>{monthLabel(viewMonth)}</h2>
          </div>
          <button
            aria-label="Následující měsíc"
            className="month-button"
            onClick={() => changeMonth(1)}
            type="button"
          >
            →
          </button>
        </div>
        <button
          className="primary-button"
          onClick={() => setFormOpen((current) => !current)}
          type="button"
        >
          {formOpen ? "Zavřít" : "+ Přidat obsah"}
        </button>
      </div>

      {formOpen ? (
        <section className="panel inline-form" aria-label="Nový obsah">
          <label>
            Název
            <input
              autoFocus
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Např. Volné ranní termíny"
              value={title}
            />
          </label>
          <label>
            Formát
            <select
              onChange={(event) => setType(event.target.value)}
              value={type}
            >
              <option>STORY</option>
              <option>REEL</option>
              <option>POST</option>
              <option>ÚKOL</option>
            </select>
          </label>
          <label>
            Datum
            <input
              onChange={(event) => setDate(event.target.value)}
              type="date"
              value={date}
            />
          </label>
          <button
            className="primary-button"
            disabled={!title.trim() || !date}
            onClick={addItem}
            type="button"
          >
            Přidat do plánu
          </button>
        </section>
      ) : null}

      {notice ? (
        <div className="notice-bar" role="status">
          {notice}
        </div>
      ) : null}

      <div className="calendar-controls">
        <div className="filter-row" aria-label="Filtry kalendáře">
          {filters.map((item) => (
            <button
              className={`filter-pill ${filter === item ? "active" : ""}`}
              key={item}
              onClick={() => setFilter(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
        <p className="calendar-help">
          Přetáhni položku na jiný den nebo ji otevři kliknutím.
        </p>
      </div>

      <section className="panel calendar-panel">
        <div className="calendar-weekdays">
          {weekdays.map((weekday) => (
            <strong key={weekday}>{weekday}</strong>
          ))}
        </div>
        <div className="calendar-grid">
          {calendarDays.map((calendarDay) => {
            const dayItems = visibleItems.filter(
              (candidate) => candidate.date === calendarDay.date,
            );
            return (
              <div
                className={`calendar-day ${calendarDay.outside ? "outside" : ""}`}
                key={calendarDay.date}
                onDragOver={(event) => {
                  if (!calendarDay.outside) event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (!calendarDay.outside)
                    moveItem(
                      event.dataTransfer.getData("text/calendar-item"),
                      calendarDay.date,
                    );
                }}
              >
                <span className="day-number">{calendarDay.day}</span>
                {!calendarDay.outside
                  ? dayItems.map((item) => {
                      const readiness = readinessFor(
                        item,
                        Boolean(visualMeta[item.id]),
                      );
                      return (
                        <button
                          className={`calendar-event ${item.state}`}
                          draggable
                          key={item.id}
                          onClick={() => openEditor(item)}
                          onDragStart={(event) => {
                            event.dataTransfer.effectAllowed = "move";
                            event.dataTransfer.setData(
                              "text/calendar-item",
                              item.id,
                            );
                          }}
                          type="button"
                        >
                          <small>{item.type}</small>
                          <strong>{item.title}</strong>
                          {item.type !== "ÚKOL" ? (
                            <span
                              className={`calendar-visual-status ${readiness.state}`}
                            >
                              {readiness.label}
                            </span>
                          ) : null}
                        </button>
                      );
                    })
                  : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="panel monthly-plan-card" id="monthly-plan">
        <div>
          <p className="eyebrow accent">Měsíční plán · září</p>
          <h2>
            {approved
              ? "Plán je schválený"
              : "AI návrh čeká na tvoje schválení"}
          </h2>
          <p className="muted">
            Téma: Návrat do rytmu · rozvržení je připravené přímo v kalendáři
            září.
          </p>
        </div>
        <div className="button-row wrap-buttons">
          {viewMonth !== "2026-09" ? (
            <button
              className="secondary-button"
              onClick={() => {
                setViewMonth("2026-09");
                setDate("2026-09-01");
              }}
              type="button"
            >
              Zobrazit září
            </button>
          ) : null}
          <Link
            className="secondary-button link-button"
            href="/ai?intent=edit-plan"
          >
            Upravit s AI
          </Link>
          <button
            className={`primary-button ${approved ? "completed-button" : ""}`}
            disabled={approved}
            onClick={approvePlan}
            type="button"
          >
            {approved ? "✓ Schváleno" : "Schválit plán"}
          </button>
        </div>
      </section>

      {editingItem ? (
        <div
          className="dialog-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEditingId(null);
          }}
          role="presentation"
        >
          <section
            aria-labelledby="calendar-edit-title"
            aria-modal="true"
            className="panel calendar-dialog"
            role="dialog"
          >
            <div className="panel-heading">
              <div>
                <p className="eyebrow accent">
                  {editingItem.type === "ÚKOL"
                    ? "Detail úkolu"
                    : "Detail obsahu"}
                </p>
                <h2 id="calendar-edit-title">{editingItem.title}</h2>
              </div>
              <button
                aria-label="Zavřít"
                className="dialog-close"
                onClick={() => setEditingId(null)}
                type="button"
              >
                ×
              </button>
            </div>
            {editingItem.type !== "ÚKOL" &&
            editingContent &&
            contentKit &&
            editingReadiness ? (
              <>
                <div className="calendar-content-detail">
                  <div className="calendar-visual-column">
                    {activeVisual ? (
                      <NextImage
                        alt={`Grafika pro ${editingItem.title}`}
                        className="calendar-generated-visual"
                        height={editingItem.type === "POST" ? 1350 : 1920}
                        src={activeVisual.dataUrl}
                        unoptimized
                        width={1080}
                      />
                    ) : (
                      <div
                        className={`calendar-asset-preview ${editingItem.type === "STORY" ? "light" : "dark"}`}
                      >
                        <span>MY FIT</span>
                        <strong>
                          {selectedTextVariant?.headline ?? editingItem.title}
                        </strong>
                        <small>
                          {selectedTextVariant?.cta ?? editingContent.cta} →
                        </small>
                      </div>
                    )}
                    <div
                      className={`visual-readiness ${editingReadiness.state}`}
                    >
                      <strong>{editingReadiness.label}</strong>
                      <small>{editingReadiness.detail}</small>
                    </div>
                    <button
                      className="primary-button"
                      disabled={visualBusy}
                      onClick={generateVisual}
                      type="button"
                    >
                      {visualBusy
                        ? "Agent tvoří grafiku…"
                        : activeVisual
                          ? "Vytvořit novou variantu"
                          : "Vygenerovat grafiku s agentem"}
                    </button>
                    {activeVisual ? (
                      <a
                        className="secondary-button link-button"
                        download={`myfit-${editingItem.id}.png`}
                        href={activeVisual.dataUrl}
                      >
                        Stáhnout PNG
                      </a>
                    ) : null}
                  </div>
                  <div>
                    <dl className="facts-list calendar-content-facts">
                      <div>
                        <dt>Hlavní sdělení</dt>
                        <dd>
                          {selectedTextVariant?.message ??
                            editingContent.message}
                        </dd>
                      </div>
                      <div>
                        <dt>Podklady</dt>
                        <dd>{editingContent.format}</dd>
                      </div>
                      <div>
                        <dt>CTA</dt>
                        <dd>
                          {selectedTextVariant?.cta ?? editingContent.cta}
                        </dd>
                      </div>
                      <div>
                        <dt>Stav</dt>
                        <dd>
                          {editingItem.state === "draft"
                            ? "Návrh před schválením"
                            : "Naplánováno"}
                        </dd>
                      </div>
                    </dl>

                    <section className="text-variant-section">
                      <div className="section-heading-compact">
                        <div>
                          <p className="eyebrow accent">Text od AI</p>
                          <h3>Vyber jednu ze 3 variant</h3>
                        </div>
                        {kitMode ? (
                          <span className={`agent-result-mode ${kitMode}`}>
                            {kitMode === "live" ? "Živá AI" : "Demo"}
                          </span>
                        ) : null}
                      </div>
                      <div className="text-variant-grid">
                        {contentKit.textVariants.map((variant) => (
                          <button
                            className={`text-variant-card ${selectedVariantId === variant.id ? "selected" : ""}`}
                            key={variant.id}
                            onClick={() => setSelectedVariantId(variant.id)}
                            type="button"
                          >
                            <span>{variant.label}</span>
                            <strong>{variant.headline}</strong>
                            <small>{variant.message}</small>
                          </button>
                        ))}
                      </div>
                      {selectedTextVariant ? (
                        <div className="selected-copy-preview">
                          <strong>Caption</strong>
                          <p>{selectedTextVariant.caption}</p>
                        </div>
                      ) : null}
                    </section>
                  </div>
                </div>

                <section className="event-agent-panel">
                  <div className="section-heading-compact">
                    <div>
                      <p className="eyebrow accent">Agent této události</p>
                      <h3>Uprav text nebo grafický směr</h3>
                    </div>
                  </div>
                  <div className="event-agent-actions">
                    {[
                      "Zkrať text a nech jen jednu myšlenku.",
                      "Udělej text více prémiový a klidný.",
                      "Navrhni jinou kompozici grafiky ve stylu MyFit.",
                    ].map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => setEventAgentMessage(prompt)}
                        type="button"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                  <div className="event-agent-thread">
                    {eventAgentEntries.map((entry, index) => (
                      <p className={entry.role} key={`${entry.role}-${index}`}>
                        {entry.text}
                      </p>
                    ))}
                  </div>
                  <div className="event-agent-composer">
                    <textarea
                      aria-label="Zpráva agentovi této události"
                      onChange={(event) =>
                        setEventAgentMessage(event.target.value)
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey) {
                          event.preventDefault();
                          sendEventAgentMessage();
                        }
                      }}
                      placeholder="Např. zkrať text, změň CTA nebo navrhni tmavší grafiku…"
                      rows={2}
                      value={eventAgentMessage}
                    />
                    <button
                      className="primary-button"
                      disabled={eventAgentBusy || !eventAgentMessage.trim()}
                      onClick={sendEventAgentMessage}
                      type="button"
                    >
                      {eventAgentBusy ? "Agent pracuje…" : "Odeslat"}
                    </button>
                  </div>
                </section>

                {agentSteps.length ? (
                  <section className="agent-work-log" aria-live="polite">
                    <p className="eyebrow accent">Jak agent pracoval</p>
                    <ol>
                      {agentSteps.map((step, index) => (
                        <li key={`${step}-${index}`}>{step}</li>
                      ))}
                    </ol>
                  </section>
                ) : null}
              </>
            ) : null}
            <p className="eyebrow calendar-edit-label">Upravit událost</p>
            <div className="calendar-edit-form">
              <label>
                Název
                <input
                  onChange={(event) => setEditTitle(event.target.value)}
                  value={editTitle}
                />
              </label>
              <label>
                Formát
                <select
                  onChange={(event) => setEditType(event.target.value)}
                  value={editType}
                >
                  <option>STORY</option>
                  <option>REEL</option>
                  <option>POST</option>
                  <option>ÚKOL</option>
                </select>
              </label>
              <label>
                Datum
                <input
                  onChange={(event) => setEditDate(event.target.value)}
                  type="date"
                  value={editDate}
                />
              </label>
            </div>
            <div className="button-row dialog-actions">
              {editingItem.type !== "ÚKOL" ? (
                <Link
                  className="secondary-button link-button"
                  href={`/ai?intent=change-content&title=${encodeURIComponent(editingItem.title)}`}
                >
                  Otevřít plný AI chat
                </Link>
              ) : null}
              <button
                className="primary-button"
                disabled={!editTitle.trim() || !editDate}
                onClick={saveEditedItem}
                type="button"
              >
                Uložit změny
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
