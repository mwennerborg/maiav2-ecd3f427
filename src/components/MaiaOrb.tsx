import { cn } from "@/lib/utils";

export type OrbState = "idle" | "listening" | "thinking" | "speaking";

interface MaiaOrbProps {
  state?: OrbState;
  size?: number;
  className?: string;
}

export function MaiaOrb({ state = "idle", size = 220, className }: MaiaOrbProps) {
  return (
    <div
      className={cn("relative", className)}
      style={{ width: size, height: size }}
      aria-label={`MAIA orb — ${state}`}
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-60"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--orb-purple) 55%, transparent), transparent 70%)",
          animation: "orb-pulse 4s ease-in-out infinite",
        }}
      />

      {/* Rotating aura ring */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "-6%",
          background:
            "conic-gradient(from 0deg, var(--orb-blue), var(--orb-turquoise), var(--orb-pink), var(--orb-purple), var(--orb-blue))",
          filter: "blur(18px)",
          opacity: 0.55,
          animation: `orb-rotate ${state === "thinking" ? "6s" : "18s"} linear infinite`,
        }}
      />

      {/* Main orb body */}
      <div
        className="absolute inset-0 rounded-full overflow-hidden"
        style={{
          background: "var(--gradient-orb)",
          boxShadow: "var(--shadow-orb)",
          animation:
            state === "listening"
              ? "orb-listen 1.4s ease-in-out infinite"
              : state === "thinking"
                ? "orb-float 3s ease-in-out infinite, orb-think 2.5s ease-in-out infinite"
                : state === "speaking"
                  ? "orb-listen 0.7s ease-in-out infinite"
                  : "orb-float 6s ease-in-out infinite",
        }}
      >
        {/* Inner swirl */}
        <div
          className="absolute inset-0 rounded-full mix-blend-screen"
          style={{
            background:
              "conic-gradient(from 90deg, transparent, color-mix(in oklab, var(--orb-turquoise) 60%, transparent), transparent, color-mix(in oklab, var(--orb-pink) 60%, transparent), transparent)",
            animation: "orb-rotate-reverse 14s linear infinite",
            opacity: 0.7,
          }}
        />

        {/* Specular highlight */}
        <div
          className="absolute rounded-full"
          style={{
            top: "12%",
            left: "18%",
            width: "38%",
            height: "28%",
            background:
              "radial-gradient(ellipse, oklch(1 0 0 / 0.75), oklch(1 0 0 / 0) 70%)",
            filter: "blur(6px)",
          }}
        />

        {/* Subtle glass rim */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            boxShadow: "inset 0 0 40px oklch(1 0 0 / 0.15), inset 0 -20px 40px oklch(0.2 0.05 265 / 0.15)",
          }}
        />
      </div>
    </div>
  );
}
