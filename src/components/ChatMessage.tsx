import { Copy, Check, User, Bot } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
          "prose prose-sm max-w-none dark:prose-invert break-words",
          "text-foreground prose-headings:text-foreground prose-headings:font-display",
          "prose-strong:text-foreground prose-code:text-accent prose-code:before:content-none prose-code:after:content-none",
          "prose-a:text-primary prose-a:no-underline hover:prose-a:underline",
          "prose-blockquote:border-accent prose-blockquote:text-muted-foreground prose-blockquote:not-italic",
          "prose-hr:border-accent/30",
          "prose-li:marker:text-accent",
          "prose-table:my-3"
        )}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }: any) {
                if (inline) {
                  return (
                    <code className="px-1.5 py-0.5 rounded bg-muted text-accent font-mono text-[0.85em]" {...props}>
                      {children}
                    </code>
                  );
                }
                return (
                  <code className={cn("font-mono text-sm", className)} {...props}>
                    {children}
                  </code>
                );
              },
              pre({ children }) {
                return (
                  <pre className="rounded-lg border border-accent/30 bg-muted/60 backdrop-blur-sm p-4 overflow-x-auto my-3">
                    {children}
                  </pre>
                );
              },
              a({ href, children, ...props }) {
                return (
                  <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
                    {children}
                  </a>
                );
              },
              table({ children }) {
                return (
                  <div className="overflow-x-auto my-3 rounded-lg border border-accent/20">
                    <table className="min-w-full">{children}</table>
                  </div>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
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
