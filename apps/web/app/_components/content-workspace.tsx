"use client";

import Link from "next/link";
import NextImage from "next/image";
import { useEffect, useState } from "react";

import {
  MYFIT_VISUAL_STYLE_VERSION,
  myfitVisualTemplates,
  type MyfitStoryComposition,
  type MyfitVisualTemplate,
} from "../_lib/myfit-visual-system";

type StoryFrame = { position: number; text: string; direction: string };
type VisualResponse = {
  data?: {
    mode: "live" | "demo";
    imageDataUrl: string | null;
    template: MyfitVisualTemplate;
    composition: MyfitStoryComposition;
  };
  error?: { message: string };
};
type StoredVisual = {
  dataUrl: string;
  mode: "live" | "demo";
  styleVersion: string;
  template: MyfitVisualTemplate;
  composition: MyfitStoryComposition;
};

const VISUAL_STORAGE_KEY = "myfit-story-visual-state";
const ACTIVE_TEMPLATE: MyfitVisualTemplate = "story_private_benefit";

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";

  words.forEach((word) => {
    const candidate = `${line} ${word}`.trim();
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });
  if (line) lines.push(line);
  return lines;
}

async function createStoryGraphic(
  headline: string,
  backgroundDataUrl: string | null,
  composition: MyfitStoryComposition,
) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Prohlížeč nepodporuje tvorbu grafiky.");

  context.fillStyle = "#f3dcc2";
  context.fillRect(0, 0, 1080, 1920);

  if (backgroundDataUrl) {
    const image = new Image();
    image.src = backgroundDataUrl;
    await image.decode();
    const scale = Math.max(1080 / image.width, 1920 / image.height);
    const width = image.width * scale;
    const height = image.height * scale;
    context.drawImage(
      image,
      (1080 - width) / 2,
      (1920 - height) / 2,
      width,
      height,
    );
    const shade =
      composition === "editorial_split"
        ? context.createLinearGradient(0, 0, 930, 0)
        : context.createLinearGradient(0, 240, 0, 1760);
    if (composition === "editorial_split") {
      shade.addColorStop(0, "rgba(243, 220, 194, .99)");
      shade.addColorStop(0.48, "rgba(243, 220, 194, .94)");
      shade.addColorStop(0.78, "rgba(243, 220, 194, .25)");
      shade.addColorStop(1, "rgba(243, 220, 194, .03)");
    } else {
      shade.addColorStop(0, "rgba(243, 220, 194, .08)");
      shade.addColorStop(0.62, "rgba(243, 220, 194, .18)");
      shade.addColorStop(1, "rgba(243, 220, 194, .92)");
    }
    context.fillStyle = shade;
    context.fillRect(0, 0, 1080, 1920);
  } else {
    const sunlight = context.createLinearGradient(540, 170, 1040, 1390);
    sunlight.addColorStop(0, "#f8edda");
    sunlight.addColorStop(0.5, "#d9b878");
    sunlight.addColorStop(1, "#8c6a35");
    context.fillStyle = sunlight;
    context.fillRect(560, 150, 520, 1260);
    context.fillStyle = "rgba(255, 250, 235, .78)";
    context.fillRect(640, 250, 310, 610);
    context.strokeStyle = "rgba(8, 10, 14, .78)";
    context.lineWidth = 28;
    context.strokeRect(820, 330, 220, 850);
    context.lineWidth = 16;
    [520, 690, 860, 1030].forEach((position) => {
      context.beginPath();
      context.moveTo(805, position);
      context.lineTo(1060, position);
      context.stroke();
    });
    context.fillStyle = "rgba(8, 10, 14, .76)";
    context.roundRect(650, 1060, 380, 92, 18);
    context.fill();
    context.save();
    context.globalAlpha = 0.14;
    context.strokeStyle = "#ffffff";
    context.lineWidth = 18;
    for (let offset = -300; offset < 900; offset += 95) {
      context.beginPath();
      context.moveTo(560 + offset, 150);
      context.lineTo(1080 + offset, 1410);
      context.stroke();
    }
    context.restore();
    const shade = context.createLinearGradient(0, 0, 920, 0);
    shade.addColorStop(0, "rgba(243, 220, 194, 1)");
    shade.addColorStop(0.5, "rgba(243, 220, 194, .94)");
    shade.addColorStop(0.82, "rgba(243, 220, 194, .16)");
    shade.addColorStop(1, "rgba(243, 220, 194, 0)");
    context.fillStyle = shade;
    context.fillRect(0, 0, 1080, 1920);
  }

  if (composition === "photo_forward") {
    context.fillStyle = "rgba(243, 220, 194, .88)";
    context.beginPath();
    context.roundRect(54, 70, 430, 155, 24);
    context.fill();
    context.strokeStyle = "#b8872d";
    context.lineWidth = 3;
    context.stroke();
    context.fillStyle = "#b8872d";
    context.font = "400 54px Arial";
    context.fillText("MY", 88, 145);
    context.strokeRect(200, 96, 105, 72);
    context.font = "400 38px Courier New";
    context.fillText("FIT", 216, 145);
    context.font = "400 17px Courier New";
    context.fillText("P R I V A T E   F I T N E S S", 88, 194);

    context.fillStyle = "rgba(243, 220, 194, .9)";
    context.beginPath();
    context.roundRect(54, 330, 760, 650, 34);
    context.fill();
    context.strokeStyle = "#b8872d";
    context.lineWidth = 4;
    context.stroke();
    context.fillStyle = "#b8872d";
    context.font = "400 38px Courier New";
    context.fillText("SOUKROMÍ", 108, 420);
    context.fillStyle = "#111114";
    context.font = "400 66px Courier New";
    const photoForwardLines = wrapText(
      context,
      headline.toLocaleUpperCase("cs-CZ"),
      650,
    ).slice(0, 5);
    photoForwardLines.forEach((line, index) =>
      context.fillText(line, 108, 530 + index * 76),
    );
    context.strokeStyle = "#b8872d";
    context.beginPath();
    context.moveTo(108, 900);
    context.lineTo(680, 900);
    context.stroke();
    context.fillStyle = "#111114";
    context.font = "italic 29px Georgia";
    context.fillText("Zacvič si. Vyčisti hlavu. Nabij tělo.", 108, 946);

    context.fillStyle = "rgba(243, 220, 194, .92)";
    context.beginPath();
    context.roundRect(250, 1370, 776, 360, 36);
    context.fill();
    context.strokeStyle = "#b8872d";
    context.stroke();
    context.fillStyle = "#b8872d";
    context.font = "400 27px Courier New";
    context.fillText("CELÉ FITNESS JEN PRO TEBE", 310, 1450);
    context.fillStyle = "#111114";
    context.font = "400 47px Courier New";
    context.fillText("TVŮJ ČAS. TVÉ TEMPO.", 310, 1530);
    context.fillStyle = "#c49432";
    context.beginPath();
    context.roundRect(310, 1580, 410, 92, 14);
    context.fill();
    context.fillStyle = "#fff8ec";
    context.font = "400 27px Courier New";
    context.fillText("REZERVOVAT TERMÍN", 365, 1637);
    context.fillStyle = "#8f661b";
    context.font = "400 22px Courier New";
    context.fillText("MYFITGYM.CZ", 60, 1840);
    return canvas.toDataURL("image/png");
  }

  context.fillStyle = "#b8872d";
  context.font = "400 64px Arial";
  context.fillText("MY", 62, 128);
  context.strokeStyle = "#b8872d";
  context.lineWidth = 3;
  context.strokeRect(188, 62, 124, 92);
  context.font = "400 47px Courier New";
  context.fillText("FIT", 207, 125);
  context.font = "400 20px Courier New";
  context.fillText("P R I V A T E   F I T N E S S", 64, 198);

  context.fillStyle = "#b8872d";
  context.font = "400 45px Courier New";
  context.fillText("SOUKROMÍ", 60, 390);
  context.fillStyle = "#111114";
  context.font = "400 72px Courier New";
  const lines = wrapText(
    context,
    headline.toLocaleUpperCase("cs-CZ"),
    720,
  ).slice(0, 5);
  lines.forEach((line, index) => context.fillText(line, 60, 485 + index * 82));

  const dividerY = 940;
  const divider = context.createLinearGradient(40, 0, 560, 0);
  divider.addColorStop(0, "#dbbe50");
  divider.addColorStop(0.5, "#b26c00");
  divider.addColorStop(1, "#e0c76c");
  context.strokeStyle = divider;
  context.lineWidth = 5;
  context.beginPath();
  context.moveTo(0, dividerY);
  context.lineTo(245, dividerY);
  context.moveTo(315, dividerY);
  context.lineTo(565, dividerY);
  context.stroke();
  context.fillStyle = "#b8872d";
  context.font = "400 68px Georgia";
  context.fillText("♡", 251, dividerY + 22);

  context.fillStyle = "#111114";
  context.font = "400 38px Courier New";
  context.fillText("CELÉ FITNESS JEN PRO TEBE.", 60, 1055);
  context.font = "italic 31px Georgia";
  context.fillText("Zacvič si. Vyčisti hlavu. Nabij tělo.", 60, 1160);
  context.fillStyle = "#b8872d";
  context.font = "400 34px Courier New";
  context.fillText("UDĚLEJ SI ČAS PRO SEBE", 60, 1245);

  context.fillStyle = "rgba(243, 220, 194, .78)";
  context.beginPath();
  context.roundRect(64, 1450, 952, 290, 42);
  context.fill();
  context.strokeStyle = "#b8872d";
  context.lineWidth = 4;
  context.stroke();
  context.fillStyle = "#b8872d";
  context.font = "400 29px Courier New";
  context.fillText("TVŮJ SOUKROMÝ ČAS", 126, 1535);
  context.fillStyle = "#111114";
  context.font = "400 48px Courier New";
  context.fillText("BEZ ČEKÁNÍ", 126, 1610);
  context.fillStyle = "#c49432";
  context.beginPath();
  context.roundRect(570, 1515, 365, 96, 16);
  context.fill();
  context.fillStyle = "#fff8ec";
  context.font = "400 28px Courier New";
  context.fillText("REZERVOVAT", 645, 1575);
  context.fillStyle = "#111114";
  context.font = "400 24px Courier New";
  context.fillText("VYBER SI SVŮJ TERMÍN  →", 570, 1665);
  context.fillStyle = "#8f661b";
  context.font = "400 23px Courier New";
  context.fillText("MYFITGYM.CZ", 60, 1840);

  return canvas.toDataURL("image/png");
}

export function ContentWorkspace({
  initialFrames,
}: {
  initialFrames: StoryFrame[];
}) {
  const [frames, setFrames] = useState(initialFrames);
  const [editing, setEditing] = useState(false);
  const [published, setPublished] = useState(false);
  const [visual, setVisual] = useState<string | null>(null);
  const [visualMode, setVisualMode] = useState<"live" | "demo" | null>(null);
  const [visualComposition, setVisualComposition] =
    useState<MyfitStoryComposition>("editorial_split");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      const savedFrames = window.localStorage.getItem("myfit-story-frames");
      if (savedFrames) setFrames(JSON.parse(savedFrames) as StoryFrame[]);
      setPublished(
        window.localStorage.getItem("myfit-story-published") === "yes",
      );
      const savedVisual = window.localStorage.getItem(VISUAL_STORAGE_KEY);
      if (savedVisual) {
        try {
          const parsedVisual = JSON.parse(savedVisual) as StoredVisual;
          if (parsedVisual.styleVersion === MYFIT_VISUAL_STYLE_VERSION) {
            setVisual(parsedVisual.dataUrl);
            setVisualMode(parsedVisual.mode);
            setVisualComposition(parsedVisual.composition ?? "editorial_split");
          } else {
            window.localStorage.removeItem(VISUAL_STORAGE_KEY);
          }
        } catch {
          window.localStorage.removeItem(VISUAL_STORAGE_KEY);
        }
      }
      window.localStorage.removeItem("myfit-story-visual");
      window.localStorage.removeItem("myfit-story-visual-v2");
    });
    return () => window.cancelAnimationFrame(frameId);
  }, []);

  function saveFrames() {
    window.localStorage.setItem("myfit-story-frames", JSON.stringify(frames));
    setEditing(false);
    setNotice("Texty jsou uložené v tomto zařízení.");
  }

  async function generateVisual() {
    setBusy(true);
    setNotice("");
    try {
      const headline =
        frames[1]?.text ?? frames[0]?.text ?? "Soukromí bez čekání";
      const nextComposition: MyfitStoryComposition = visual
        ? visualComposition === "editorial_split"
          ? "photo_forward"
          : "editorial_split"
        : "editorial_split";
      const response = await fetch("/api/v1/ai/visual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          headline,
          format: "story",
          template: ACTIVE_TEMPLATE,
          composition: nextComposition,
          theme: "Soukromí, klid a fitness bez čekání na stroje",
        }),
      });
      const result = (await response.json()) as VisualResponse;
      if (!response.ok || !result.data) throw new Error(result.error?.message);
      const template = myfitVisualTemplates[result.data.template];
      const graphic = await createStoryGraphic(
        headline,
        result.data.imageDataUrl ?? template.backgroundAsset,
        result.data.composition,
      );
      setVisual(graphic);
      setVisualMode(result.data.mode);
      setVisualComposition(result.data.composition);
      window.localStorage.setItem(
        VISUAL_STORAGE_KEY,
        JSON.stringify({
          dataUrl: graphic,
          mode: result.data.mode,
          styleVersion: MYFIT_VISUAL_STYLE_VERSION,
          template: result.data.template,
          composition: result.data.composition,
        } satisfies StoredVisual),
      );
      setNotice(
        result.data.mode === "live"
          ? "AI grafika je připravená."
          : "Grafika je připravená v bezpečném demo režimu.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Grafiku se nepodařilo vytvořit.",
      );
    } finally {
      setBusy(false);
    }
  }

  function togglePublished() {
    setPublished((current) => {
      const next = !current;
      window.localStorage.setItem("myfit-story-published", next ? "yes" : "no");
      setNotice(
        next
          ? "Obsah je označený jako publikovaný."
          : "Publikování bylo vráceno.",
      );
      return next;
    });
  }

  return (
    <>
      {notice ? (
        <div className="notice-bar" role="status">
          {notice}
        </div>
      ) : null}
      <div className="detail-layout">
        <section className="panel detail-main">
          <div className="panel-heading">
            <div>
              <p className="eyebrow accent">Story série</p>
              <h2>3 navazující obrazovky</h2>
            </div>
            <button
              className="secondary-button"
              onClick={() => (editing ? saveFrames() : setEditing(true))}
              type="button"
            >
              {editing ? "Uložit texty" : "Upravit texty"}
            </button>
          </div>
          <div className="frame-detail-list">
            {frames.map((frame, index) => (
              <article className="frame-detail" key={frame.position}>
                <div className="frame-number">{frame.position}</div>
                <div className="frame-fields">
                  {editing ? (
                    <>
                      <input
                        aria-label={`Text obrazovky ${frame.position}`}
                        value={frame.text}
                        onChange={(event) =>
                          setFrames((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, text: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                      <textarea
                        aria-label={`Režie obrazovky ${frame.position}`}
                        value={frame.direction}
                        onChange={(event) =>
                          setFrames((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, direction: event.target.value }
                                : item,
                            ),
                          )
                        }
                        rows={2}
                      />
                    </>
                  ) : (
                    <>
                      <h3>{frame.text}</h3>
                      <p>{frame.direction}</p>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="detail-sidebar">
          <section className="panel">
            <p className="eyebrow">Publikační podklady</p>
            <dl className="facts-list">
              <div>
                <dt>CTA</dt>
                <dd>Rezervovat termín</dd>
              </div>
              <div>
                <dt>Téma</dt>
                <dd>Soukromí</dd>
              </div>
              <div>
                <dt>Cíl</dt>
                <dd>Akvizice</dd>
              </div>
              <div>
                <dt>Formát</dt>
                <dd>1080 × 1920 PNG</dd>
              </div>
            </dl>
          </section>
          <section className="panel visual-card">
            <p className="eyebrow accent">MyFit vizuální směr</p>
            <h2>{myfitVisualTemplates[ACTIVE_TEMPLATE].label}</h2>
            {visual ? (
              <NextImage
                alt="Vygenerovaná Story grafika MyFit"
                className="generated-visual"
                height={1920}
                src={visual}
                unoptimized
                width={1080}
              />
            ) : (
              <div className="visual-placeholder">
                <span>MY</span>
                <strong>MyFit Visual</strong>
                <small>
                  AI může měnit fotografii i kompozici. Barvy, typografie, logo
                  a prémiový charakter zůstávají MyFit.
                </small>
              </div>
            )}
            {visualMode ? (
              <p className="visual-mode">
                {visualMode === "live" ? "Vytvořeno AI" : "Demo grafika"}
              </p>
            ) : null}
            <button
              className="primary-button"
              disabled={busy}
              onClick={generateVisual}
              type="button"
            >
              {busy
                ? "Tvořím grafiku…"
                : visual
                  ? "Vytvořit novou grafiku"
                  : "Vytvořit grafiku"}
            </button>
            {visual ? (
              <a
                className="secondary-button link-button download-button"
                download="myfit-story-soukromi.png"
                href={visual}
              >
                Stáhnout PNG
              </a>
            ) : null}
          </section>
        </aside>
      </div>

      <section className="panel action-bar">
        <div>
          <p className="eyebrow">Realizace</p>
          <h2>Co chceš s obsahem udělat?</h2>
        </div>
        <div className="button-row wrap-buttons">
          <button
            className={`primary-button ${published ? "completed-button" : ""}`}
            onClick={togglePublished}
            type="button"
          >
            {published ? "✓ Publikováno" : "Označit jako publikované"}
          </button>
          <Link
            className="secondary-button link-button"
            href="/ai?intent=change-content"
          >
            Změnit s AI
          </Link>
          <Link className="secondary-button link-button" href="/calendar">
            Přesunout
          </Link>
        </div>
      </section>
    </>
  );
}
