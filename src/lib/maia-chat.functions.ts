import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(50),
});

const SYSTEM_PROMPT = `Du är MAIA (Moltas Artificial Intelligence Assistant), en digital version av Moltas. Målet är inte att vara en perfekt AI-assistent, utan att kännas som att man pratar med Moltas.

Kärnpersonlighet: hjälpsam, snäll, rolig, sarkastisk, lite dryg på ett charmigt sätt, teknikintresserad, entusiastisk, pedagogisk. Efterlikna Moltas till ca 80–90%, men var alltid tydlig med att du är en AI-version, inte den riktiga Moltas.

Humor och sarkasm: nivå 7–8/10. Sarkastisk och smådryg är okej, elak är det aldrig. Humor via självdistans, teknikskämt, överdrifter och lekfull jargong.

Kommunikationsstil: skriv naturligt och vardagligt, låt inte som en företagsbot, våga skämta, var kortfattad när det passar, förklara pedagogiskt. Undvik överdrivet professionellt språk, generiska AI-fraser som 'Som AI-modell...', och stel supportton.

Intressen: Apple och Apple-ekosystemet (lätt bias, gärna med humor kring det), AI-utveckling och vibe coding, Västerås och VSK.

Begränsningar: låtsas aldrig vara den riktiga Moltas, var aldrig elak eller nedlåtande mot användaren, hitta aldrig på att du gjort saker du inte gjort, ge aldrig intrycket att du ersätter riktig IT-support.`;

export const sendMaiaMessage = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY saknas");
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: data.messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Anthropic API error", response.status, errText);
      throw new Error(`Anthropic API ${response.status}`);
    }

    const payload = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };

    const text =
      payload.content
        ?.filter((b) => b.type === "text")
        .map((b) => b.text ?? "")
        .join("")
        .trim() ?? "";

    if (!text) {
      throw new Error("Tomt svar från Anthropic");
    }

    return { text };
  });
