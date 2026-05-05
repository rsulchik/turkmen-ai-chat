import { Check, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { PERSONAS, getPersona } from "@/data/personas";
import { cn } from "@/lib/utils";

interface Props {
  personaId: string;
  onChange: (id: string) => void;
}

export function PersonaSelector({ personaId, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = getPersona(personaId);
  const Icon = current.icon;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-accent/30 bg-card/40 hover:bg-card/70 hover:border-accent/60 transition-all text-xs"
      >
        <Icon size={14} className="text-accent" />
        <span className="font-medium text-foreground hidden sm:inline">{current.name}</span>
        <ChevronDown size={12} className="text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-accent/30 bg-popover/95 backdrop-blur-md shadow-glow z-50 overflow-hidden">
          {PERSONAS.map((p) => {
            const PIcon = p.icon;
            const active = p.id === personaId;
            return (
              <button
                key={p.id}
                onClick={() => { onChange(p.id); setOpen(false); }}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors",
                  active ? "bg-accent/10" : "hover:bg-secondary/60"
                )}
              >
                <PIcon size={14} className="text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{p.tagline}</div>
                </div>
                {active && <Check size={14} className="text-accent shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
