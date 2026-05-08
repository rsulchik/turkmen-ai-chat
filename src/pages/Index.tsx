import { useRef, useEffect, useState } from "react";
import { Menu, Share2, ArrowDown } from "lucide-react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatMessage } from "@/components/ChatMessage";
import { ChatInput } from "@/components/ChatInput";
import { TypingIndicator } from "@/components/TypingIndicator";
import { EmptyChat } from "@/components/EmptyChat";
import { ThemeToggle } from "@/components/ThemeToggle";
import { TurkmenLogo } from "@/components/TurkmenLogo";
import { PersonaSelector } from "@/components/PersonaSelector";
import { useChat } from "@/hooks/useChat";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

function makeToken() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

const Index = () => {
  const {
    chats,
    activeChat,
    activeChatId,
    isLoading,
    personaId,
    setPersonaId,
    createChat,
    deleteChat,
    setActiveChatId,
    sendMessage,
    stopGeneration,
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAtBottom) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChat?.messages, isLoading, isAtBottom]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distance < 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setIsAtBottom(true);
  };

  const canShare = !!activeChat && activeChat.messages.length > 0;

  const handleShare = async () => {
    if (!activeChat || sharing) return;
    setSharing(true);
    try {
      const token = makeToken();
      const messages = activeChat.messages.map((m) => ({
        role: m.role,
        content: m.content,
        images: m.images,
      }));
      const { error } = await supabase.from("shared_chats").insert({
        share_token: token,
        title: activeChat.title,
        messages,
      });
      if (error) throw error;
      const url = `${window.location.origin}${import.meta.env.BASE_URL}share/${token}`;
      await navigator.clipboard.writeText(url);
      toast({ title: "Salgy göçürildi", description: url });
    } catch (e: any) {
      toast({ title: "Paýlaşmak başartmady", description: e?.message, variant: "destructive" });
    } finally {
      setSharing(false);
    }
  };

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
        <header className="relative z-10 flex items-center gap-2 px-4 py-3 border-b border-accent/20 glass">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary transition-colors lg:hidden text-foreground"
          >
            <Menu size={20} />
          </button>

          <div className="lg:hidden">
            <TurkmenLogo size="sm" showText={false} />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm font-medium text-foreground truncate">
              {activeChat?.title || (
                <span className="text-muted-foreground italic">Täze söhbet</span>
              )}
            </h1>
          </div>

          <PersonaSelector personaId={personaId} onChange={setPersonaId} />

          <button
            onClick={handleShare}
            disabled={!canShare || sharing}
            title="Söhbeti paýlaş"
            className="p-2 rounded-lg hover:bg-secondary transition-colors text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <Share2 size={18} />
          </button>

          <ThemeToggle />
        </header>

        {!activeChat || activeChat.messages.length === 0 ? (
          <EmptyChat onSend={sendMessage} personaId={personaId} onPersonaChange={setPersonaId} />
        ) : (
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto scrollbar-thin"
          >
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

        {!isAtBottom && activeChat && activeChat.messages.length > 0 && (
          <button
            onClick={scrollToBottom}
            title="Aşak"
            aria-label="Aşak"
            className="absolute bottom-28 right-6 z-20 p-2.5 rounded-full bg-secondary/90 backdrop-blur-md border border-accent/30 text-foreground shadow-lg hover:bg-accent hover:text-accent-foreground transition-all"
          >
            <ArrowDown size={18} />
          </button>
        )}

        <ChatInput onSend={sendMessage} isLoading={isLoading} onStop={stopGeneration} />
      </div>
    </div>
  );
};

export default Index;
