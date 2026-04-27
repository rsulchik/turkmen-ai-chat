import { Bot } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex gap-3 px-4 py-5 md:px-8 bg-chat-ai/60 backdrop-blur-sm animate-fade-in-up">
      <div className="relative shrink-0 w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-gold text-accent-foreground shadow-glow animate-glow">
        <Bot size={16} />
      </div>
      <div className="flex items-center gap-1.5 pt-3">
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0s" }} />
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.2s" }} />
        <span className="w-2 h-2 rounded-full bg-accent animate-pulse-dot" style={{ animationDelay: "0.4s" }} />
      </div>
    </div>
  );
}
