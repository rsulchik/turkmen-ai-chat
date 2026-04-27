import { useRef, useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { EmptyChat } from "@/components/EmptyChat";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TurkmenLogo } from "@/components/TurkmenLogo";
import { useChat } from "@/hooks/useChat";

const Index = () => {
  const {
    chats,
    activeChat,
    activeChatId,
    isLoading,
    createChat,
    deleteChat,
    setActiveChatId,
    sendMessage,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isLoading]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ChatSidebar
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={(id) => {
          setActiveChatId(id);
          setSidebarOpen(false);
        }}
        onNewChat={() => {
          createChat();
          setSidebarOpen(false);
        }}
        onDeleteChat={deleteChat}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="relative z-10 flex items-center gap-3 px-4 py-3 border-b border-accent/20 glass">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors md:hidden text-foreground"
          >
            <Menu size={20} />
          </button>

          <div className="md:hidden">
            <TurkmenLogo size="sm" showText={false} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-medium text-foreground truncate">
              {activeChat?.title || (
                <span className="text-muted-foreground italic">Täze söhbet</span>
              )}
            </h1>
          </div>

          <ThemeToggle />
        </header>

        {!activeChat || activeChat.messages.length === 0 ? (
          <EmptyChat onSend={sendMessage} />
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-thin">
            <div className="max-w-3xl mx-auto">
              {activeChat.messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && activeChat.messages[activeChat.messages.length - 1]?.role === "user" && (
                <TypingIndicator />
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <ChatInput onSend={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default Index;
