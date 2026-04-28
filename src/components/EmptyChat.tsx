import { Sparkles } from "lucide-react";
import { TurkmenLogo } from "./TurkmenLogo";
import { OrnamentBackground } from "./OrnamentBackground";

interface EmptyChatProps {
  onSend: (message: string) => void;
}

const suggestions = [
  "Türkmenistanyň paýtagty haýsy?",
  "Magtymguly barada gürrüň ber",
  "Türkmen dilinde salam nähili diýilýär?",
  "Garagum çöli barada maglumat ber",
];

export function EmptyChat({ onSend }: EmptyChatProps) {
  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-4 overflow-hidden bg-gradient-hero">
      <OrnamentBackground opacity={0.07} />

      <div className="relative flex flex-col items-center animate-fade-in-up">
        <div className="mb-8">
          <TurkmenLogo size="lg" />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-accent font-semibold">
            Akylly Söhbetdeş
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-accent" />
        </div>

        <p className="text-muted-foreground text-sm md:text-base mb-10 text-center max-w-md leading-relaxed">
          Türkmen dilinde professional ýardamçy.
          <br />
          Sorag beriň — düşnükli we anyk jogap alyň.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
          {suggestions.map((s, idx) => (
            <button
              key={s}
              onClick={() => onSend(s)}
              style={{ animationDelay: `${idx * 80}ms` }}
              className="group/card animate-fade-in-up flex items-start gap-2.5 p-4 rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm hover:border-accent/60 hover:bg-card/80 hover:shadow-glow transition-all text-left text-sm"
            >
              <Sparkles size={16} className="text-accent mt-0.5 shrink-0 group-hover/card:scale-110 transition-transform" />
              <span className="text-foreground/90 group-hover/card:text-foreground">{s}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
