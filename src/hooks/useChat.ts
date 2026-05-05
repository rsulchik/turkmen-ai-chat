import { useState, useCallback } from "react";
import { Chat, Message } from "@/types/chat";
import { DEFAULT_PERSONA_ID } from "@/data/personas";

function generateId() {
  return crypto.randomUUID();
}

const PERSONA_KEY = "turkmen-ai:persona";

function loadPersona(): string {
  if (typeof window === "undefined") return DEFAULT_PERSONA_ID;
  return localStorage.getItem(PERSONA_KEY) || DEFAULT_PERSONA_ID;
}

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [personaId, setPersonaIdState] = useState<string>(loadPersona);

  const setPersonaId = useCallback((id: string) => {
    setPersonaIdState(id);
    try { localStorage.setItem(PERSONA_KEY, id); } catch {}
    // also bind to active chat if it exists and has no messages yet
    setChats((prev) => prev.map((c) =>
      c.id === activeChatId && c.messages.length === 0 ? { ...c, personaId: id } : c
    ));
  }, [activeChatId]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  const createChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: "Täze söhbet",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      personaId,
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, [personaId]);

  const deleteChat = useCallback(
    (chatId: string) => {
      setChats((prev) => prev.filter((c) => c.id !== chatId));
      if (activeChatId === chatId) {
        setActiveChatId(null);
      }
    },
    [activeChatId]
  );

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      let chatId = activeChatId;
      if (!chatId) {
        chatId = createChat();
      }

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
        images: images && images.length ? images : undefined,
      };

      setChats((prev) =>
        prev.map((c) => {
          if (c.id !== chatId) return c;
          const updated = {
            ...c,
            messages: [...c.messages, userMessage],
            updatedAt: new Date(),
          };
          if (c.messages.length === 0) {
            updated.title = content.slice(0, 40) + (content.length > 40 ? "..." : "");
            if (!updated.personaId) updated.personaId = personaId;
          }
          return updated;
        })
      );

      setIsLoading(true);

      try {
        const currentChat = chats.find((c) => c.id === chatId);
        const chatPersona = currentChat?.personaId || personaId;

        // Build multimodal-aware history
        const history = (currentChat?.messages || []).map((m) => {
          if (m.role === "user" && m.images && m.images.length) {
            const parts: any[] = m.images.map((url) => ({
              type: "image_url",
              image_url: { url },
            }));
            if (m.content) parts.unshift({ type: "text", text: m.content });
            return { role: "user", content: parts };
          }
          return { role: m.role, content: m.content };
        });

        let newUserPayload: any;
        if (images && images.length) {
          const parts: any[] = images.map((url) => ({
            type: "image_url",
            image_url: { url },
          }));
          if (content) parts.unshift({ type: "text", text: content });
          newUserPayload = { role: "user", content: parts };
        } else {
          newUserPayload = { role: "user", content };
        }

        const allMessages = [...history, newUserPayload];

        const hasImages = allMessages.some(
          (m) => Array.isArray(m.content) && m.content.some((p: any) => p.type === "image_url")
        );

        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/turkmen-chat`;

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: allMessages, personaId: chatPersona, hasImages }),
        });

        if (!resp.ok || !resp.body) {
          if (resp.status === 429) throw new Error("Köp haýyş iberildi, biraz garaşyň.");
          if (resp.status === 402) throw new Error("Kredit gutardy, balansyňyzy dolduryň.");
          throw new Error("Jogap almakda säwlik boldy.");
        }

        const reader = resp.body.getReader();
        const decoder = new TextDecoder();
        let textBuffer = "";
        let assistantContent = "";
        const assistantId = generateId();

        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    { id: assistantId, role: "assistant", content: "", timestamp: new Date() },
                  ],
                  updatedAt: new Date(),
                }
              : c
          )
        );

        let streamDone = false;
        while (!streamDone) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
            let line = textBuffer.slice(0, newlineIndex);
            textBuffer = textBuffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (line.startsWith(":") || line.trim() === "") continue;
            if (!line.startsWith("data: ")) continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") {
              streamDone = true;
              break;
            }
            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
              if (delta) {
                assistantContent += delta;
                const snap = assistantContent;
                setChats((prev) =>
                  prev.map((c) =>
                    c.id === chatId
                      ? {
                          ...c,
                          messages: c.messages.map((m) =>
                            m.id === assistantId ? { ...m, content: snap } : m
                          ),
                        }
                      : c
                  )
                );
              }
            } catch {
              textBuffer = line + "\n" + textBuffer;
              break;
            }
          }
        }
      } catch (err: any) {
        const errorMessage: Message = {
          id: generateId(),
          role: "assistant",
          content: `⚠️ ${err.message || "Näbelli säwlik ýüze çykdy."}`,
          timestamp: new Date(),
        };
        setChats((prev) =>
          prev.map((c) =>
            c.id === chatId
              ? { ...c, messages: [...c.messages, errorMessage], updatedAt: new Date() }
              : c
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeChatId, chats, createChat, personaId]
  );

  return {
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
  };
}
