import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import { Chat } from "@/types/chat";
import { cn } from "@/lib/utils";
import { TurkmenLogo } from "./TurkmenLogo";
import { OrnamentBackground } from "./OrnamentBackground";

interface ChatSidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatSidebar({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed md:relative z-50 md:z-auto flex flex-col h-full w-72 transition-transform duration-300 ease-in-out",
          "glass-strong border-r border-accent/20",
          "before:absolute before:right-0 before:top-0 before:bottom-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-accent/40 before:to-transparent",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <OrnamentBackground opacity={0.04} />

        <div className="relative flex items-center justify-between p-4 border-b border-sidebar-border-c/50">
          <TurkmenLogo size="sm" />
          <div className="flex items-center gap-1">
            <button
              onClick={onNewChat}
              className="p-2 rounded-lg bg-gradient-primary text-primary-foreground hover:shadow-emerald transition-all hover:scale-105"
              title="Täze söhbet"
            >
              <Plus size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-sidebar-hover transition-colors text-sidebar-fg md:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative flex items-center gap-2 px-4 pt-4 pb-2">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
          <span className="text-[10px] font-semibold text-muted-foreground tracking-[0.2em] uppercase">
            Söhbetler
          </span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>

        <div className="relative flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {chats.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-8 px-4 italic">
              Entek söhbet ýok.<br />Täze söhbet başlaň!
            </p>
          )}
          {chats.map((chat) => {
            const active = activeChatId === chat.id;
            return (
              <div
                key={chat.id}
                className={cn(
                  "group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all",
                  active
                    ? "bg-sidebar-active text-sidebar-active-fg shadow-sm"
                    : "hover:bg-sidebar-hover/70 text-sidebar-fg"
                )}
                onClick={() => onSelectChat(chat.id)}
              >
                {active && (
                  <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-gradient-gold" />
                )}
                <MessageSquare size={14} className={cn("shrink-0", active ? "text-accent" : "opacity-50")} />
                <span className="flex-1 text-sm truncate">{chat.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>

        <div className="relative p-4 border-t border-sidebar-border-c/50">
          <div className="text-[10px] text-muted-foreground text-center tracking-wider">
            <span className="text-accent">◆</span> Sopyyev Software <span className="text-accent">◆</span>
          </div>
        </div>
      </aside>
    </>
  );
}
