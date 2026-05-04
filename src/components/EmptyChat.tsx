import { Sparkles, Quote, RefreshCw } from "lucide-react";
import { useState } from "react";
import { TurkmenLogo } from "./TurkmenLogo";
import { OrnamentBackground } from "./OrnamentBackground";
import { getRandomProverb } from "@/data/proverbs";

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
  const [proverb, setProverb] = useState(() => getRandomProverb());

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-hidden bg-gradient-hero">
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

        <div
          className="mt-10 w-full max-w-2xl animate-fade-in-up"
          style={{ animationDelay: "320ms" }}
        >
          <div className="relative rounded-2xl border border-accent/30 bg-card/40 backdrop-blur-md p-5 md:p-6 shadow-glow overflow-hidden">
            <div className="absolute inset-0 bg-carpet-pattern opacity-[0.04] pointer-events-none" />
            <div className="relative flex items-start gap-4">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-gold flex items-center justify-center shadow-sm">
                <Quote size={18} className="text-accent-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-accent font-semibold">
                    Halk pähimi
                  </span>
                  <button
                    onClick={() => setProverb(getRandomProverb())}
                    className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-accent transition-colors px-2 py-1 rounded-md hover:bg-accent/10"
                    aria-label="Başga pähim"
                  >
                    <RefreshCw size={12} />
                    Täzele
                  </button>
                </div>
                <p
                  key={proverb.text}
                  className="font-display text-base md:text-lg text-foreground/95 leading-snug italic animate-fade-in-up"
                >
                  «{proverb.text}»
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
