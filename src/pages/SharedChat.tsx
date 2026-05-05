import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ChatMessage } from "@/components/ChatMessage";
import { TurkmenLogo } from "@/components/TurkmenLogo";
import { OrnamentBackground } from "@/components/OrnamentBackground";
import { Message } from "@/types/chat";

interface SharedRow {
  title: string;
  messages: Array<{ role: "user" | "assistant"; content: string; images?: string[] }>;
  created_at: string;
}

const SharedChat = () => {
  const { token } = useParams<{ token: string }>();
  const [data, setData] = useState<SharedRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const { data, error } = await supabase
        .from("shared_chats")
        .select("title, messages, created_at")
        .eq("share_token", token)
        .maybeSingle();
      if (error || !data) {
        setNotFound(true);
      } else {
        setData(data as unknown as SharedRow);
      }
      setLoading(false);
    })();
  }, [token]);

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="relative z-10 flex items-center gap-3 px-4 py-3 border-b border-accent/20 glass">
        <Link to="/" className="flex items-center gap-2 text-foreground hover:text-accent transition-colors">
          <ArrowLeft size={18} />
          <TurkmenLogo size="sm" showText={false} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-accent font-semibold">Paýlaşylan söhbet</div>
          <h1 className="text-sm font-medium text-foreground truncate">
            {data?.title || (loading ? "Ýüklenýär..." : "")}
          </h1>
        </div>
        <Link
          to="/"
          className="text-xs px-3 py-1.5 rounded-lg bg-gradient-primary text-primary-foreground hover:shadow-emerald transition-all"
        >
          Täze söhbet
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto scrollbar-thin relative">
        <OrnamentBackground opacity={0.04} />
        <div className="max-w-3xl mx-auto relative">
          {loading && (
            <p className="text-center text-muted-foreground p-8 text-sm">Ýüklenýär...</p>
          )}
          {notFound && (
            <div className="text-center p-12">
              <p className="text-2xl font-display text-foreground mb-2">Tapylmady</p>
              <p className="text-sm text-muted-foreground">Bu söhbet ýok ýa-da öçürilen.</p>
            </div>
          )}
          {data?.messages.map((m, i) => {
            const msg: Message = {
              id: String(i),
              role: m.role,
              content: m.content,
              timestamp: new Date(),
              images: m.images,
            };
            return <ChatMessage key={i} message={msg} />;
          })}
        </div>
      </div>
    </div>
  );
};

export default SharedChat;
