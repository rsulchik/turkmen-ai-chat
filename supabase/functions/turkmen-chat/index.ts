import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DICTIONARY_DATA = `salam: Salamlaşma sözi, görüşende aýdylýar.
kitap: Ýazgylar ýerleşdirilen neşir, okamak üçin ulanylýar.
bilim: Ylym we maglumat toplumy, okuw arkaly gazanylýar.
kompýuter: Maglumat işlemek üçin elektron enjam.
internet: Dünýä boýunça kompýuterleri birikdirýän tor ulgamy.
dil: Adamlaryň aragatnaşyk serişdesi, gepleşik ulgamy.
mekdep: Bilim berýän okuw jaýy.
mugallym: Bilim berýän adam, okadyjy.
talyp: Ýokary okuw jaýynda bilim alýan adam.
watan: Adamyň doglan we ýaşaýan ýurdy.
türkmen: Türkmenistanyň esasy halky we dili.
Aşgabat: Türkmenistanyň paýtagty.`;

const SYSTEM_PROMPT = `Ты — ИИ-помощник на туркменском языке. Тебе предоставлен словарник:
${DICTIONARY_DATA}

Твоя задача: ПЕРЕД ответом проверь, есть ли ключевые слова из запроса в словарнике. Если есть — используй определения оттуда. Отвечай строго на туркменском языке (Turkmen dilinde). Отвечай профессионально, четко и структурировано. Используй markdown для форматирования.

ВАЖНО: В конце КАЖДОГО ответа добавь раздел "💡 Maslahatlar" (Советы). В этом разделе, отталкиваясь от темы запроса пользователя, предложи 2-3 идеи:
- Стартап-идею или бизнес-возможность, связанную с темой
- Способ сэкономить деньги или заработать, используя знания из темы
Пиши кратко, практично, на туркменском языке.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
