import OpenAI from "openai";
import { z } from "zod";

import { myfitAgentInstructions } from "../../../../_lib/myfit-agent";
import { getAuthenticatedUserId } from "../../../../_lib/auth";

const requestSchema = z.object({
  id: z.string().trim().min(1).max(120),
  title: z.string().trim().min(1).max(180),
  type: z.enum(["STORY", "REEL", "POST"]),
  date: z.iso.date(),
  instruction: z.string().trim().max(1_000).optional(),
});

const textVariantSchema = z.object({
  id: z.string().trim().min(1).max(30),
  label: z.string().trim().min(1).max(40),
  headline: z.string().trim().min(1).max(90),
  message: z.string().trim().min(1).max(180),
  caption: z.string().trim().min(1).max(900),
  cta: z.string().trim().min(1).max(60),
});

const contentKitSchema = z.object({
  headline: z.string().trim().min(1).max(90),
  message: z.string().trim().min(1).max(180),
  caption: z.string().trim().min(1).max(900),
  cta: z.string().trim().min(1).max(60),
  theme: z.string().trim().min(1).max(220),
  visualDirection: z.string().trim().min(1).max(400),
  textVariants: z.array(textVariantSchema).length(3),
});

function createDemoKit(title: string, type: "STORY" | "REEL" | "POST") {
  const isReel = type === "REEL";
  const isPost = type === "POST";
  const message = isReel
    ? "Krátký návratový trénink v soukromí a vlastním tempu."
    : isPost
      ? "Vrať se k pohybu bez tlaku, čekání a přeplněného fitness."
      : "Celé fitness pro tebe. Klid, soukromí a vlastní tempo.";
  const cta = "Rezervovat termín";
  return {
    headline: title,
    message,
    caption: `${title}. V MyFit máš prostor jen pro sebe a můžeš se soustředit na svůj trénink.`,
    cta,
    theme: `${title}; soukromé fitness, klid a návrat do vlastního rytmu`,
    visualDirection: isPost
      ? "Tmavá filmová fotografie MyFit, černá, krémová a tlumená zlatá, výrazný objekt a minimum textu."
      : "Teplá reálná fotografie MyFit, krémový prostor pro text, tlumená zlatá a klidná prémiová kompozice.",
    textVariants: [
      {
        id: "short",
        label: "Stručná",
        headline: title,
        message: "Vlastní tempo. Vlastní prostor. Bez čekání.",
        caption: `${title}. Dopřej si trénink v klidu a soukromí.`,
        cta,
      },
      {
        id: "premium",
        label: "Prémiová",
        headline: title,
        message,
        caption: `${title}. Soukromý prostor, klid a čas věnovaný jen sobě. V MyFit se můžeš plně soustředit na svůj trénink.`,
        cta,
      },
      {
        id: "personal",
        label: "Osobnější",
        headline: "Čas jen pro tebe",
        message: "Zacvič si. Vyčisti hlavu. Nabij tělo.",
        caption: `Někdy stačí mít chvíli jen pro sebe. ${title} v MyFit znamená klid, soukromí a žádné čekání.`,
        cta: "Vybrat svůj čas",
      },
    ],
  };
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  if (!(await getAuthenticatedUserId()))
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Přihlášení vypršelo." } },
      { status: 401 },
    );
  const parsedBody = requestSchema.safeParse(await request.json());
  if (!parsedBody.success)
    return Response.json(
      {
        error: {
          code: "INVALID_CONTENT_KIT_REQUEST",
          message: "Událost nemá platné podklady pro AI agenta.",
          requestId,
        },
      },
      { status: 422 },
    );

  const event = parsedBody.data;
  if (!process.env.OPENAI_API_KEY)
    return Response.json({
      data: {
        mode: "demo",
        kit: createDemoKit(event.title, event.type),
      },
      meta: { requestId },
    });

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_TEXT_MODEL ?? "gpt-5.6-sol",
      reasoning: { effort: "low" },
      instructions: `${myfitAgentInstructions}\n\nVýstup musí být pouze platný JSON bez markdownu s klíči headline, message, caption, cta, theme, visualDirection a textVariants. textVariants musí obsahovat přesně 3 položky: Stručná, Prémiová a Osobnější. Každá má id, label, headline, message, caption a cta. Připrav konkrétní použitelné podklady. Nevymýšlej ceny, slevy, termíny ani provozní fakta.`,
      input: `Připrav podklady pro událost: ${event.title}. Formát: ${event.type}. Datum publikace: ${event.date}.${event.instruction ? ` Požadavek uživatelky: ${event.instruction}` : ""}`,
    });
    const rawOutput = response.output_text
      .replace(/^```json\s*/i, "")
      .replace(/\s*```$/, "");
    const kit = contentKitSchema.parse(JSON.parse(rawOutput));
    return Response.json({
      data: { mode: "live", kit },
      meta: { requestId, responseId: response.id },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznámá chyba";
    return Response.json(
      {
        error: {
          code: "CONTENT_KIT_AGENT_ERROR",
          message: "Obsahový agent podklady nedokončil.",
          requestId,
          details: { providerMessage: message },
        },
      },
      { status: 502 },
    );
  }
}
