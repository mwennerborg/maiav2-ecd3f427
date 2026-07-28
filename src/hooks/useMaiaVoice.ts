import { useCallback, useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import type { OrbState } from "@/components/MaiaOrb";
import { sendMaiaMessage } from "@/lib/maia-chat.functions";
import { synthesizeMaiaSpeech } from "@/lib/maia-tts.functions";

// Kopplar ihop hela röstloopen:
//   mikrofon → tal-till-text (sv-SE, gratis) → Claude (sendMaiaMessage)
//   → ElevenLabs-klonen (synthesizeMaiaSpeech) → uppspelning
// Exponerar orbState + amplitude (0..1) så orben kan pulsa i takt med rösten,
// både när DU pratar och när MAIA svarar.

type ChatMsg = { role: "user" | "assistant"; content: string };

function base64ToBlobUrl(b64: string): string {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return URL.createObjectURL(new Blob([bytes], { type: "audio/mpeg" }));
}

export function useMaiaVoice(options?: { handsFree?: boolean }) {
  const handsFree = options?.handsFree ?? true;

  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [amplitude, setAmplitude] = useState(0);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [error, setError] = useState<string | null>(null);

  const send = useServerFn(sendMaiaMessage);
  const tts = useServerFn(synthesizeMaiaSpeech);

  const historyRef = useRef<ChatMsg[]>([]);
  const micRef = useRef<{ stream: MediaStream; ctx: AudioContext; raf: number } | null>(null);
  const recRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stateRef = useRef<OrbState>("idle");
  const startRef = useRef<() => void>(() => {});
  const activeRef = useRef(false); // true medan ett samtal pågår

  const setState = (s: OrbState) => {
    stateRef.current = s;
    setOrbState(s);
  };

  const stopMic = useCallback(() => {
    const m = micRef.current;
    if (!m) return;
    cancelAnimationFrame(m.raf);
    m.stream.getTracks().forEach((t) => t.stop());
    m.ctx.close().catch(() => {});
    micRef.current = null;
    setAmplitude(0);
  }, []);

  // Spela klonens ljud och driv orbens amplitud från själva vågformen.
  const playAudio = useCallback(
    (b64: string) =>
      new Promise<void>((resolve) => {
        let raf = 0;
        let ctx: AudioContext | null = null;
        const url = base64ToBlobUrl(b64);
        const audio = new Audio(url);
        audioRef.current = audio;
        try {
          ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const src = ctx.createMediaElementSource(audio);
          const analyser = ctx.createAnalyser();
          analyser.fftSize = 256;
          src.connect(analyser);
          analyser.connect(ctx.destination); // annars hörs inget
          const data = new Uint8Array(analyser.frequencyBinCount);
          const tick = () => {
            analyser.getByteTimeDomainData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) {
              const v = (data[i] - 128) / 128;
              sum += v * v;
            }
            setAmplitude(Math.min(1, Math.sqrt(sum / data.length) * 3.2));
            raf = requestAnimationFrame(tick);
          };
          audio.onplay = () => tick();
        } catch {
          /* utan Web Audio spelas ljudet ändå, bara utan puls */
        }
        const done = () => {
          cancelAnimationFrame(raf);
          setAmplitude(0);
          URL.revokeObjectURL(url);
          ctx?.close().catch(() => {});
          audioRef.current = null;
          resolve();
        };
        audio.onended = done;
        audio.onerror = done;
        Promise.resolve(ctx?.resume?.()).finally(() => audio.play().catch(done));
      }),
    [],
  );

  const handleUtterance = useCallback(
    async (text: string) => {
      setError(null);
      historyRef.current = [...historyRef.current, { role: "user" as const, content: text }].slice(-20);
      setState("thinking");
      try {
        const { text: answer } = await send({ data: { messages: historyRef.current } });
        historyRef.current = [...historyRef.current, { role: "assistant" as const, content: answer }].slice(-20);
        setReply(answer);
        setState("speaking");
        const { audioBase64 } = await tts({ data: { text: answer } });
        await playAudio(audioBase64);
      } catch (e) {
        console.error(e);
        setError("Något strulade — testa igen.");
      } finally {
        if (activeRef.current && handsFree) startRef.current();
        else setState("idle");
      }
    },
    [send, tts, playAudio, handsFree],
  );

  const startListening = useCallback(async () => {
    activeRef.current = true;
    setTranscript("");
    setReply("");
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    // Mikrofon → amplitud för orben medan du pratar.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      const data = new Uint8Array(analyser.frequencyBinCount);
      const entry = { stream, ctx, raf: 0 };
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
          const v = (data[i] - 128) / 128;
          sum += v * v;
        }
        setAmplitude(Math.min(1, Math.sqrt(sum / data.length) * 3.2));
        entry.raf = requestAnimationFrame(tick);
      };
      micRef.current = entry;
      entry.raf = requestAnimationFrame(tick);
    } catch {
      /* mic nekad: ingen puls, men igenkänningen kan ändå fungera */
    }

    if (!SR) {
      setError("Din webbläsare stödjer inte röstinmatning — Chrome funkar bäst.");
      stopMic();
      setState("idle");
      return;
    }

    const rec = new SR();
    rec.lang = "sv-SE";
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const s = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += s;
        else interim += s;
      }
      setTranscript((finalText + " " + interim).trim());
    };
    rec.onerror = () => {};
    rec.onend = () => {
      stopMic();
      if (!activeRef.current) {
        setState("idle"); // användaren avbröt
        return;
      }
      const said = finalText.trim();
      if (said) handleUtterance(said);
      else setState("idle"); // tystnad avslutar rundan
    };
    recRef.current = rec;
    setState("listening");
    try {
      rec.start();
    } catch {
      stopMic();
      setState("idle");
    }
  }, [handleUtterance, stopMic]);

  startRef.current = startListening;

  const start = useCallback(() => {
    if (stateRef.current === "idle") startListening();
  }, [startListening]);

  const stop = useCallback(() => {
    activeRef.current = false;
    try {
      recRef.current?.abort?.();
    } catch {}
    try {
      audioRef.current?.pause();
    } catch {}
    stopMic();
    setState("idle");
  }, [stopMic]);

  const toggle = useCallback(() => {
    if (stateRef.current === "idle") startListening();
    else stop();
  }, [startListening, stop]);

  useEffect(() => () => stop(), [stop]);

  return { orbState, amplitude, transcript, reply, error, start, stop, toggle };
}
