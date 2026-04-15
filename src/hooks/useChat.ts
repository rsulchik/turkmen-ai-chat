import { useState, useCallback } from "react";
import { Chat, Message } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

function generateId() {
  return crypto.randomUUID();
}

export function useChat() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  const createChat = useCallback(() => {
    const newChat: Chat = {
      id: generateId(),
      title: "Täze söhbet",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    return newChat.id;
  }, []);

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
    async (content: string) => {
      let chatId = activeChatId;
      if (!chatId) {
        chatId = createChat();
      }

      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
        timestamp: new Date(),
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
          }
          return updated;
        })
      );

      setIsLoading(true);

      try {
        const currentChat = chats.find((c) => c.id === chatId);
        const allMessages = [
          ...(currentChat?.messages || []).map((m) => ({
            role: m.role as "user" | "assistant",
            content: m.content,
          })),
          { role: "user" as const, content },
        ];

        const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/turkmen-chat`;

        const resp = await fetch(CHAT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ messages: allMessages }),
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

        // Add empty assistant message
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
    [activeChatId, chats, createChat]
  );

  return {
    chats,
    activeChat,
    activeChatId,
    isLoading,
    createChat,
    deleteChat,
    setActiveChatId,
    sendMessage,
  };
}
