import { Plus, MessageSquare, Trash2, X } from "lucide-react";
import { Chat } from "@/types/chat";
import { cn } from "@/lib/utils";

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
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "fixed md:relative z-50 md:z-auto flex flex-col h-full bg-sidebar-bg border-r border-sidebar-border-c transition-transform duration-300 ease-in-out",
          "w-72 md:w-72",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-sidebar-border-c">
          <h2 className="text-sm font-semibold text-sidebar-fg tracking-wide uppercase">
            Söhbetler
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onNewChat}
              className="p-2 rounded-lg hover:bg-sidebar-hover transition-colors text-sidebar-fg"
              title="Täze söhbet"
            >
              <Plus size={18} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-sidebar-hover transition-colors text-sidebar-fg md:hidden"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Chat list */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-1">
          {chats.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-8 px-4">
              Entek söhbet ýok. Täze söhbet başlaň!
            </p>
          )}
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors",
                activeChatId === chat.id
                  ? "bg-sidebar-active text-sidebar-active-fg"
                  : "hover:bg-sidebar-hover text-sidebar-fg"
              )}
              onClick={() => onSelectChat(chat.id)}
            >
              <MessageSquare size={16} className="shrink-0 opacity-60" />
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
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border-c">
          <p className="text-xs text-muted-foreground text-center">Turkmen AI Chat</p>
        </div>
      </aside>
    </>
  );
}
