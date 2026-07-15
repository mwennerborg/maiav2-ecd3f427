import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { MaiaOrb } from "@/components/MaiaOrb";
import { MaiaIntro } from "@/components/MaiaIntro";
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

function Index() {
  const [phase, setPhase] = useState<"intro" | "chat">("intro");
  const [fading, setFading] = useState(false);

  const leaveIntro = () => {
    if (phase !== "intro" || fading) return;
    setFading(true);
    setTimeout(() => setPhase("chat"), 650);
  };

  return (
    <main className="relative min-h-screen w-full overflow-x-hidden">
      {/* Header */}
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center pt-6">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-4 py-1.5 backdrop-blur-xl">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: "var(--gradient-orb)" }}
          />
          <span className="text-sm font-medium tracking-tight">MAIA</span>
        </div>
      </header>

      {phase === "intro" ? (
        <button
          type="button"
          onClick={leaveIntro}
          className="flex min-h-screen w-full cursor-pointer flex-col items-center justify-center gap-10 px-6 pt-24 pb-16 text-left transition-opacity duration-700 focus:outline-none"
          style={{ opacity: fading ? 0 : 1 }}
          aria-label="Starta samtal"
        >
          <MaiaOrb size={260} className="animate-fade-in" />
          <MaiaIntro onFinished={() => {}} />
          <p className="text-xs font-light uppercase tracking-[0.25em] text-muted-foreground/80 animate-fade-in">
            Tryck var som helst för att fortsätta
          </p>
        </button>
      ) : (
        <div className="animate-fade-in pt-16">
          <MaiaChat />
        </div>
      )}
    </main>
  );
}
