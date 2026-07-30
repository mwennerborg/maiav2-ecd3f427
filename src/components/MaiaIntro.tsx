import { useState } from "react";
import { Typewriter } from "./Typewriter";

const LINES = [
  "Hej!",
  "Jag är MAIA.",
  "Moltas Artificial Intelligence Assistant.",
];

interface MaiaIntroProps {
  onFinished?: () => void;
}

export function MaiaIntro({ onFinished }: MaiaIntroProps) {
  const [step, setStep] = useState(0);

  return (
    <div className="mx-auto max-w-2xl space-y-2 px-6 text-center">
      {LINES.slice(0, step + 1).map((line, i) => {
        const isCurrent = i === step;
        return (
          <p
            key={i}
            className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground"
          >
            {isCurrent ? (
              <Typewriter
                text={line}
                speed={45}
                onDone={() => {
                  if (i < LINES.length - 1) {
                    setTimeout(() => setStep((s) => (s === i ? s + 1 : s)), 320);
                  } else {
                    setTimeout(() => onFinished?.(), 600);
                  }
                }}
              />
            ) : (
              line
            )}
          </p>
        );
      })}
    </div>
  );
}
