import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { MaiaOrb, type OrbState } from "./MaiaOrb";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "maia";
  text: string;
}

const CANNED_REPLIES = [
  "Intressant fråga. Moltas hade förmodligen svarat med en dålig ordvits här.",
  "Jag skulle gärna hjälpa dig med det — men just nu är jag mest en väldigt vacker orb.",
  "Moltas ligger på stranden. Jag gör mitt bästa. Det räcker nog inte, men ändå.",
  "Bra input. Jag noterar det och glömmer det direkt, precis som Moltas skulle gjort.",
  "Om jag var en riktig människa hade jag nickat eftertänksamt just nu.",
];

export function MaiaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, orbState]);

  const send = (e: FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: value };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setOrbState("thinking");

    setTimeout(() => {
      setOrbState("speaking");
      const reply: Message = {
        id: crypto.randomUUID(),
        role: "maia",
        text: CANNED_REPLIES[Math.floor(Math.random() * CANNED_REPLIES.length)],
      };
      setMessages((m) => [...m, reply]);
      setTimeout(() => setOrbState("idle"), 1600);
    }, 1200);
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full flex-col items-center">
      {/* Orb */}
      <div className="pt-6 sm:pt-10 animate-fade-in">
        <MaiaOrb
          state={orbState}
          size={messages.length === 0 ? 240 : 140}
          className="transition-all duration-700 ease-out"
        />
      </div>

      {/* State label */}
      <p className="mt-4 text-xs font-light uppercase tracking-[0.2em] text-muted-foreground animate-fade-in">
        {orbState === "idle" && "Redo när du är det"}
        {orbState === "listening" && "Lyssnar"}
        {orbState === "thinking" && "Tänker"}
        {orbState === "speaking" && "Svarar"}
      </p>

      {/* Conversation */}
      <div
        ref={scrollRef}
        className="mt-8 w-full max-w-2xl flex-1 space-y-4 overflow-y-auto px-6"
      >
        {messages.length === 0 && (
          <div className="mt-6 text-center animate-fade-up">
            <p className="text-lg text-muted-foreground">
              Fråga mig vad som helst. Jag lovar att svara med samma självförtroende
              som Moltas — men med mindre substans.
            </p>
          </div>
        )}

        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              "flex animate-fade-up",
              m.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-3xl px-5 py-3 text-[15px] leading-[1.55]",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-lg"
                  : "bg-card text-card-foreground rounded-bl-lg border border-border/60",
              )}
              style={m.role === "maia" ? { boxShadow: "var(--shadow-soft)" } : undefined}
            >
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="sticky bottom-0 w-full pt-6 pb-6">
        <form
          onSubmit={send}
          className="mx-auto flex w-full max-w-2xl items-center gap-2 px-6"
        >
          <div
            className="flex flex-1 items-center gap-2 rounded-full border border-border/70 bg-card/80 px-2 py-2 pl-5 backdrop-blur-xl"
            style={{ boxShadow: "var(--shadow-soft)" }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Skriv något till MAIA…"
              className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <button
              type="button"
              disabled
              aria-label="Röst kommer snart"
              title="Röst kommer snart"
              className="grid h-10 w-10 place-items-center rounded-full text-muted-foreground/70 transition hover:bg-muted disabled:cursor-not-allowed"
            >
              <Mic className="h-4 w-4" />
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              aria-label="Skicka"
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full transition-all",
                input.trim()
                  ? "bg-primary text-primary-foreground hover:scale-105"
                  : "bg-muted text-muted-foreground",
              )}
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </form>
        <p className="mt-3 text-center text-xs font-light text-muted-foreground/70">
          MAIA kan ha fel. Moltas har också fel, men mer sällan.
        </p>
      </div>
    </div>
  );
}
