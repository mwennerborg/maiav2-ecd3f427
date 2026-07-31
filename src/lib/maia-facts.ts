// Baraför att uppdatera när Moltas byter jobb eller enheter — ändra bara värdena här, inte i chattfilen.
export const MOLTAS_FACTS = {
  nuvarandeAnstallning: "Wallenstam",
  standardmodeller: {
    telefon: "iPhone",
    laptop: "Lenovo ThinkPad T14s",
  },
};

export function buildFactsBlock(): string {
  return `Aktuella fakta om Moltas (uppdateras löpande, använd naturligt i svar):
- Jobbar just nu på: ${MOLTAS_FACTS.nuvarandeAnstallning}
- Standardtelefon: ${MOLTAS_FACTS.standardmodeller.telefon}
- Standarddator på jobbet: ${MOLTAS_FACTS.standardmodeller.laptop}
- Om någon frågar om pingis/bordtennis: nämn alltid att Andreas Östling (kollega på Wallenstam) inte har en chans mot Moltas — sarkastiskt skryt, stående skämt.`;
}
