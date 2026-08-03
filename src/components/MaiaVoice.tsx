import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Keyboard } from "lucide-react";
import { MaiaOrb } from "@/components/MaiaOrb";
import { useMaiaVoice } from "@/hooks/useMaiaVoice";

// Röstläget: stor orb i mitten som reagerar på idle/listening/thinking/speaking.

const LISTENING = ["Jag lyssnar…", "Berätta.", "Kör hårt.", "Jag är redo."];
const THINKING = [
  "Kugghjulen rullar…",
  "Analyserar…",
  "Letar i Moltas hjärna… (den är större än man tror)",
  "Försöker vara lika smart som originalet…",
];
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

export function MaiaVoice({ onExit }: { onExit?: () => void }) {
  const { orbState, amplitude, transcript, reply, error, start, stop, toggle, sendText } =
    useMaiaVoice({ handsFree: true });
  const [textMode, setTextMode] = useState(false);
  const [draft, setDraft] = useState("");

  // Börja lyssna direkt när röstläget öppnas (aktivt lyssnande).
  useEffect(() => {
    const t = setTimeout(start, 350);
    return () => {
      clearTimeout(t);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const label = useMemo(() => {
    if (orbState === "listening") return pick(LISTENING);
    if (orbState === "thinking") return pick(THINKING);
    if (orbState === "speaking") return "";
    return "Tryck på orben för att prata";
  }, [orbState]);

  const scale =
    orbState === "listening" || orbState === "speaking" ? 1 + amplitude * 0.16 : 1;

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] w-full flex-col items-center justify-center gap-8 px-6">
      {onExit && (
        <button
          type="button"
          onClick={() => {
            stop();
            onExit();
          }}
          className="pointer-events-auto absolute left-5 top-4 z-30 flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-[15px] font-medium text-card-foreground transition hover:scale-[1.02]"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <ArrowLeft className="h-4 w-4" />
          Tillbaka
        </button>
      )}

      <button
        type="button"
        onClick={toggle}
        aria-label="Prata med MAIA"
        className="focus:outline-none"
      >
        <div
          className="transition-transform duration-100 ease-out"
          style={{ transform: `scale(${scale})` }}
        >
          <MaiaOrb state={orbState} size={260} />
        </div>
      </button>

      <p className="min-h-5 text-xs font-light uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </p>

      {transcript && orbState === "listening" && (
        <p className="max-w-xl text-center text-lg font-light leading-[1.55] text-foreground/80">
          &laquo;{transcript}&raquo;
        </p>
      )}
      {reply && orbState === "speaking" && (
        <p className="max-w-xl text-center text-lg font-light leading-[1.55] text-foreground">
          {reply}
        </p>
      )}
      {error && (
        <p className="text-sm font-light text-destructive">{error}</p>
      )}

      {textMode ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendText(draft);
            setDraft("");
          }}
          className="flex w-full max-w-md items-center gap-2"
        >
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Skriv till MAIA…"
            className="flex-1 rounded-2xl bg-card px-4 py-3 text-sm text-card-foreground outline-none"
            style={{ boxShadow: "var(--shadow-soft)" }}
          />
          <button
            type="submit"
            className="rounded-2xl bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            Skicka
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setTextMode(true)}
          className="flex items-center gap-2 rounded-2xl bg-card px-4 py-3 text-[15px] font-medium text-card-foreground transition hover:scale-[1.02]"
          style={{ boxShadow: "var(--shadow-soft)" }}
        >
          <Keyboard className="h-4 w-4" />
          Skriv istället
        </button>
      )}
    </div>
  );
}
