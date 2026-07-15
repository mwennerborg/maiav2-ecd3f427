import { useState } from "react";
import { Typewriter } from "./Typewriter";

const LINES = [
  "Hej!",
  "Jag är MAIA.",
  "Moltas Artificial Intelligence Assistant.",
  "Moltas njuter just nu av en välförtjänt semester, så jag har fått den omöjliga uppgiften att ersätta honom.",
  "Mitt mål är att hjälpa dig, underhålla dig och se till att du inte saknar honom för mycket.",
  "Jag kan inte lova att jag är lika bra som originalet — men jag är betydligt billigare.",
];

interface MaiaIntroProps {
  onFinished?: () => void;
}

export function MaiaIntro({ onFinished }: MaiaIntroProps) {
  const [step, setStep] = useState(0);

  return (
    <div className="mx-auto max-w-2xl space-y-4 px-6 text-center">
      {LINES.slice(0, step + 1).map((line, i) => {
        const isCurrent = i === step;
        const isHeadline = i <= 2;
        return (
          <p
            key={i}
            className={
              isHeadline
                ? "text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground"
                : "text-base sm:text-lg text-muted-foreground leading-[1.55]"
            }
          >
            {isCurrent ? (
              <Typewriter
                text={line}
                speed={isHeadline ? 45 : 18}
                onDone={() => {
                  if (i < LINES.length - 1) {
                    setTimeout(() => setStep((s) => s + 1), isHeadline ? 320 : 480);
                  } else {
                    setTimeout(() => onFinished?.(), 800);
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
