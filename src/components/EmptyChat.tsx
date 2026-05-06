import { Sparkles, Quote, RefreshCw } from "lucide-react";
import { useState } from "react";
import { TurkmenLogo } from "./TurkmenLogo";
import { OrnamentBackground } from "./OrnamentBackground";
import { getRandomProverb } from "@/data/proverbs";
import { PERSONAS } from "@/data/personas";
import { cn } from "@/lib/utils";

interface EmptyChatProps {
  onSend: (message: string) => void;
  personaId: string;
  onPersonaChange: (id: string) => void;
}

const suggestions = [
  "Türkmenistanyň paýtagty haýsy?",
  "Magtymguly barada gürrüň ber",
  "Türkmen dilinde salam nähili diýilýär?",
  "Garagum çöli barada maglumat ber",
];

export function EmptyChat({ onSend, personaId, onPersonaChange }: EmptyChatProps) {
  const [proverb, setProverb] = useState(() => getRandomProverb());

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto bg-gradient-hero">
      <OrnamentBackground opacity={0.07} />

      <div className="relative flex flex-col items-center animate-fade-in-up w-full">
        <div className="mb-6">
          <TurkmenLogo size="lg" />
        </div>

        <div className="flex items-center gap-3 mb-2">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-accent" />
          <span className="text-[11px] uppercase tracking-[0.3em] text-accent font-semibold">
            Akylly Söhbetdeş
          </span>
          <span className="h-px w-8 bg-gradient-to-l from-transparent to-accent" />
        </div>

        <p className="text-muted-foreground text-sm md:text-base mb-8 text-center max-w-md leading-relaxed">
          Türkmen dilinde professional ýardamçy.
          <br />
          Personajy saýlaň we sorag beriň.
        </p>

        {/* Personas */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-w-2xl w-full mb-8">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const active = p.id === personaId;
            return (
              <button
                key={p.id}
                onClick={() => onPersonaChange(p.id)}
                className={cn(
                  "group flex items-center gap-2 p-3 rounded-xl border backdrop-blur-sm transition-all text-left",
                  active
                    ? "border-accent bg-accent/10 shadow-glow"
                    : "border-border/60 bg-card/40 hover:border-accent/60 hover:bg-card/70"
                )}
              >
                <div className={cn(
                  "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  active ? "bg-gradient-gold text-accent-foreground" : "bg-secondary text-accent"
                )}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{p.tagline}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div
          className="mt-8 w-full max-w-2xl animate-fade-in-up"
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
