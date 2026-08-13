import OpenAI from "openai";
import { z } from "zod";

import {
  myfitStoryCompositions,
  myfitVisualTemplates,
  type MyfitStoryComposition,
  type MyfitVisualTemplate,
} from "../../../../_lib/myfit-visual-system";
import { getAuthenticatedUserId } from "../../../../_lib/auth";

const requestSchema = z.object({
  headline: z.string().trim().min(1).max(160),
  theme: z.string().trim().min(1).max(240),
  format: z.enum(["story", "post"]).default("story"),
  template: z
    .enum(["story_private_benefit", "story_availability", "post_announcement"])
    .default("story_private_benefit"),
  composition: z
    .enum(["editorial_split", "photo_forward"])
    .default("editorial_split"),
});

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  if (!(await getAuthenticatedUserId()))
    return Response.json(
      { error: { code: "UNAUTHORIZED", message: "Přihlášení vypršelo." } },
      { status: 401 },
    );
  const parsedBody = requestSchema.safeParse(await request.json());

  if (!parsedBody.success) {
    return Response.json(
      {
        error: {
          code: "INVALID_VISUAL_REQUEST",
          message: "Zadání grafiky není platné.",
          requestId,
        },
      },
      { status: 422 },
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return Response.json({
      data: {
        mode: "demo",
        imageDataUrl: null,
        template: parsedBody.data.template,
        composition: parsedBody.data.composition,
      },
      meta: { requestId },
    });
  }

  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const templateKey = parsedBody.data.template as MyfitVisualTemplate;
    const template = myfitVisualTemplates[templateKey];
    const isStory = template.format === "story";
    const composition = parsedBody.data.composition as MyfitStoryComposition;
    const compositionPrompt = myfitStoryCompositions[composition];
    const result = await client.images.generate({
      model: process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2",
      prompt: isStory
        ? `Create a new photographic art direction for a MyFit Instagram Story. Theme: ${parsedBody.data.theme}. Use this composition direction: ${compositionPrompt}. Preserve this established visual language: ${template.imagePrompt}. You may vary crop, subject placement, light balance and negative space, but the result must remain unmistakably MyFit: real private-gym photography, warm cream, deep black, muted gold, calm premium mood and no generic social-media-template look. The application adds typography and branding later. Absolutely no text, letters, logos, icons, watermarks, prices, discounts, dates, people or invented business facts.`
        : `Create a new photographic art direction for a MyFit Instagram Post. Theme: ${parsedBody.data.theme}. Preserve this established visual language: ${template.imagePrompt}. You may vary crop, subject placement, light balance and negative space, but keep deep black, cream, muted gold and a restrained premium MyFit mood. The application adds typography, verified product cutouts and branding later. Absolutely no text, letters, logos, icons, watermarks, prices, people or invented products.`,
      size: "1024x1536",
      quality: "low",
      output_format: "png",
    });
    const imageBase64 = result.data?.[0]?.b64_json;

    if (!imageBase64)
      throw new Error("Image provider did not return image data.");

    return Response.json({
      data: {
        mode: "live",
        imageDataUrl: `data:image/png;base64,${imageBase64}`,
        template: templateKey,
        composition,
      },
      meta: { requestId },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Neznámá chyba";
    return Response.json(
      {
        error: {
          code: "VISUAL_PROVIDER_ERROR",
          message: "Grafiku se nepodařilo vygenerovat.",
          requestId,
          details: { providerMessage: message },
        },
      },
      { status: 502 },
    );
  }
}
