import { Copy, Check, User, Bot } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Message } from "@/types/chat";
import { cn } from "@/lib/utils";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("group flex gap-3 px-4 py-5 md:px-8", isUser ? "bg-transparent" : "bg-chat-ai")}>
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5",
          isUser ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-muted-foreground mb-1.5">
          {isUser ? "Siz" : "Turkmen AI"}
        </div>
        <div className={cn("prose prose-sm max-w-none", "text-foreground prose-headings:text-foreground prose-strong:text-foreground prose-code:text-primary")}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Göçürildi" : "Göçürmek"}
          </button>
        )}
      </div>
    </div>
  );
}
