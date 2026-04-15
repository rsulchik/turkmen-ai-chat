import { Bot, Sparkles } from "lucide-react";

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
    <div className="flex-1 flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Bot size={32} className="text-primary" />
      </div>
      <h1 className="text-2xl font-semibold text-foreground mb-2">Turkmen AI Chat</h1>
      <p className="text-muted-foreground text-sm mb-8 text-center max-w-md">
        Türkmen dilinde ýardamçy. Sorag beriň — jogap bereýin!
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg w-full">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onSend(s)}
            className="flex items-start gap-2 p-3 rounded-xl border border-border hover:bg-accent hover:text-accent-foreground transition-colors text-left text-sm"
          >
            <Sparkles size={14} className="text-primary mt-0.5 shrink-0" />
            <span>{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
