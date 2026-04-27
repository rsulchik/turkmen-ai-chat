import { Copy, Check, User, Bot } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={cn(
        "group flex gap-3 px-4 py-5 md:px-8",
        isUser ? "bg-transparent" : "bg-chat-ai/60 backdrop-blur-sm"
      )}
    >
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center mt-0.5 shadow-sm",
          isUser
            ? "bg-gradient-primary text-primary-foreground shadow-emerald"
            : "bg-gradient-gold text-accent-foreground shadow-glow"
        )}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className="flex-1 min-w-0">
        <div className={cn(
          "text-xs font-semibold mb-1.5 tracking-wide",
          isUser ? "text-primary" : "text-accent"
        )}>
          {isUser ? "Siz" : "Turkmen AI"}
        </div>
        <div className={cn(
          "prose prose-sm max-w-none dark:prose-invert",
          "text-foreground prose-headings:text-foreground prose-headings:font-display",
          "prose-strong:text-foreground prose-code:text-accent",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
        )}>
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>

        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-accent transition-colors md:opacity-0 md:group-hover:opacity-100 px-2 py-1 rounded-md hover:bg-accent/10"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? "Göçürildi" : "Göçürmek"}
          </button>
        )}
      </div>
    </motion.div>
  );
}
