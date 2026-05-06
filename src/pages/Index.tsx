import { useRef, useEffect, useState } from "react";
import { Menu, Share2 } from "lucide-react";
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
  } = useChat();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages, isLoading]);

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
