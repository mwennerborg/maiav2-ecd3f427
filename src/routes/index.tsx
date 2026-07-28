import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Mic, Keyboard } from "lucide-react";
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

type Phase = "intro" | "choice" | "voice" | "text";

function Index() {
  // Vill du hoppa över intron och landa direkt på valet (röst/text),
  // ändra "intro" nedan till "choice".
  const [phase, setPhase] = useState("intro");
  const [fading, setFading] = useState(false);

  const leaveIntro = () => {
    if (phase !== "intro" || fading) return;
    setFading(true);
    setTimeout(() => setPhase("choice"), 650);
  };

  return (
    
      {/* Header */}
      


        


          
          MAIA
        


      



      {/* Intro */}
      {phase === "intro" && (
        
          
           {}} />
          


            Tryck var som helst för att fortsätta
          


        
      )}

      {/* Val: röst eller text */}
      {phase === "choice" && (
        


          


          


            


              Hej, jag är MAIA
            


            


              Moltas Artificial Intelligence Assistant
            


          



          


            
             setPhase("voice")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-[15px] font-medium text-primary-foreground transition hover:scale-[1.02]"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              
              Prata med röst
            
             setPhase("text")}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-4 text-[15px] font-medium text-primary-foreground transition hover:scale-[1.02]"
              style={{ boxShadow: "var(--shadow-soft)" }}
            >
              
              Skriv med text
            
          


          


            Välj röst — då hör du att det faktiskt låter som Moltas.
          


        


      )}

      {/* Röstläge */}
      {phase === "voice" && (
        


           setPhase("choice")} />
        


      )}

      {/* Textläge */}
      {phase === "text" && (
        


           setPhase("choice")}
            className="absolute left-5 top-4 z-10 text-sm font-light text-muted-foreground transition hover:text-foreground"
          >
            ← Byt läge
          
          
        


      )}
    
  );
}
