import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// MAIA:s röst via ElevenLabs (din klon).
// Speglar mönstret i maia-chat.functions.ts: server function, nyckel i env,
// aldrig i klienten. Returnerar mp3:n som base64 så den går genom samma
// serialiserade server-function-kanal som chatten.

const InputSchema = z.object({
  text: z.string().min(1).max(5000),
});

export const synthesizeMaiaSpeech = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    if (!apiKey || !voiceId) {
      throw new Error("ELEVENLABS_API_KEY eller ELEVENLABS_VOICE_ID saknas");
    }

    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "content-type": "application/json",
          accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text: data.text,
          model_id: "eleven_multilingual_v2",
          // Sätt dessa till värdena du dialade in i ElevenLabs-playgrounden.
          // Du sa att högre likhet + lite högre hastighet lät bäst.
          voice_settings: {
            stability: 0.4,
            similarity_boost: 0.9,
            speed: 1.08,
          },
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("ElevenLabs error", res.status, errText);
      throw new Error(`ElevenLabs ${res.status}`);
    }

    const buffer = await res.arrayBuffer();
    // Buffer finns i Nitro/Node-runtime. Skulle den saknas i din runtime,
    // byt raden mot en manuell base64-enkoder.
    const audioBase64 = Buffer.from(buffer).toString("base64");

    return { audioBase64 };
  });
