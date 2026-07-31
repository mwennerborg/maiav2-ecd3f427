import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mic, Keyboard, ArrowLeft } from "lucide-react";
import { MaiaOrb } from "@/components/MaiaOrb";
import { MaiaIntro } from "@/components/MaiaIntro";
import { MaiaVoice } from "@/components/MaiaVoice";
import { MaiaChat } from "@/components/MaiaChat";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MAIA — Moltas Artificial Intelligence Assistant" },
      {
        name: "description",
        content:
          "MAIA är Moltas personliga AI-assistent — designad för att underhålla, hjälpa och hålla ställningarna medan Moltas är frånvarande.",
      },
      { property: "og:title", content: "MAIA — Moltas Artificial Intelligence Assistant" },
      {
        property: "og:description",
        content:
          "MAIA är Moltas personliga AI-assistent — designad för att underhålla, hjälpa och hålla ställningarna medan Moltas är frånvarande.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Phase = "intro" | "voice" | "text";

function Index() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [showChoice, setShowChoice] = useState(false);
  const [fading, setFading] = useState(false);

  const leaveIntro = () => {
    if (showChoice || fading) return;
    setFading(true);
    setTimeout(() => setShowChoice(true), 350);
  };

  const enter = (next: Phase) => {
    setFading(true);
    setTimeout(() => {
      setPhase(next);
      setFading(false);
    }, 350);
  };

  const backToIntro = () => {
    setFading(true);
    setTimeout(() => {
      setPhase("intro");
      setShowChoice(true);
      setFading(false);
    }, 350);
  };

  return (
    <div
      className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden px-6 transition-opacity duration-300"
      style={{ opacity: fading ? 0.4 : 1 }}
    >
      {/* Header */}
      <header className="pointer-events-none absolute top-0 left-0 right-0 z-20 flex items-center justify-center px-6 py-5">
        <span className="text-sm font-medium uppercase tracking-[0.25em] text-foreground/80">
          MAIA
        </span>
      </header>

      {/* Intro + val i samma vy */}
      {phase === "intro" && (
        <div
          className="relative z-10 flex w-full max-w-2xl flex-col items-center gap-8 text-center"
          onClick={leaveIntro}
        >
          <MaiaOrb state="idle" size={180} className="animate-fade-in" />

          <div className="space-y-8">
            <MaiaIntro onFinished={() => setShowChoice(true)} />

            <div
              className={`animate-fade-up space-y-6 transition-opacity duration-500 ${
                showChoice ? "opacity-100" : "opacity-0"
              }`}
            >
              <div className="mx-auto flex w-full max-w-sm gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    enter("voice");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-[15px] font-medium text-primary-foreground transition hover:scale-[1.02]"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <Mic className="h-4 w-4" />
                  Prata med röst
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    enter("text");
                  }}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-card px-4 py-4 text-[15px] font-medium text-card-foreground transition hover:scale-[1.02]"
                  style={{ boxShadow: "var(--shadow-soft)" }}
                >
                  <Keyboard className="h-4 w-4" />
                  Skriv med text
                </button>
              </div>

              <p className="text-xs font-light uppercase tracking-[0.2em] text-muted-foreground">
                Välj röst — då hör du att det faktiskt låter som Moltas.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Röstläge */}
      {phase === "voice" && (
        <div className="w-full animate-fade-in">
          <MaiaVoice onExit={backToIntro} />
        </div>
      )}

      {/* Textläge */}
      {phase === "text" && (
        <div className="relative w-full animate-fade-in">
          <button
            type="button"
            onClick={backToIntro}
            className="pointer-events-auto absolute left-5 top-4 z-30 text-sm font-light text-muted-foreground transition hover:text-foreground"
          >
            ← Tillbaka
          </button>
          <MaiaChat />
        </div>
      )}
    </div>
  );
}
