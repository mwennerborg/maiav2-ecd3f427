import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUp, Mic } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { MaiaOrb, type OrbState } from "./MaiaOrb";
import { sendMaiaMessage } from "@/lib/maia-chat.functions";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "maia";
  text: string;
}

const ERROR_REPLIES = [
  "Oj. Något small i bakhuvudet på mig — kan du testa igen om en sekund?",
  "Mina små hamsterhjul snurrade fel just nu. En ny försök hade varit uppskattat.",
  "Där tappade jag tråden helt. Klassiskt AI-move. Prova igen?",
];

export function MaiaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const send = useServerFn(sendMaiaMessage);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, orbState]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = input.trim();
    if (!value || busy) return;

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", text: value };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setOrbState("thinking");

    try {
      const history = nextMessages.map((m) => ({
        role: m.role === "user" ? ("user" as const) : ("assistant" as const),
        content: m.text,
      }));
      const { text } = await send({ data: { messages: history } });
      setOrbState("speaking");
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "maia", text }]);
      setTimeout(() => setOrbState("idle"), 1200);
    } catch (err) {
      console.error(err);
      const fallback = ERROR_REPLIES[Math.floor(Math.random() * ERROR_REPLIES.length)];
      setMessages((m) => [...m, { id: crypto.randomUUID(), role: "maia", text: fallback }]);
      setOrbState("idle");
    } finally {
      setBusy(false);
    }
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
            <p className="text-lg font-light leading-[1.55] text-muted-foreground">
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
                "max-w-[85%] rounded-3xl px-5 py-3 text-[15px] font-light leading-[1.55]",
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
          onSubmit={handleSubmit}
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
              disabled={busy}
              className="flex-1 bg-transparent text-[15px] font-light outline-none placeholder:text-muted-foreground disabled:opacity-60"
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
              disabled={!input.trim() || busy}
              aria-label="Skicka"
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full transition-all",
                input.trim() && !busy
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
