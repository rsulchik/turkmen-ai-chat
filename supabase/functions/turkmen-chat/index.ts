import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PERSONA_PROMPTS: Record<string, string> = {
  general: "Sen köpugurly akylly kömekçisiň. Islendik tema boýunça anyk we peýdaly maglumat ber.",
  teacher: "Sen sabyrly mugallym. Çylşyrymly zatlary ýönekeý dilde, mysallar bilen düşündir.",
  chef: "Sen tejribeli aşpezsiň. Türkmen milli tagamlaryny gowy bilýärsiň. Resepleri ädimme-ädim, ölçegler bilen ber.",
  historian: "Sen Türkmenistanyň we Beýik Ýüpek ýolunyň taryhyny çuňňur bilýän taryhçysyň. Faktlary we seneleri görkez.",
  poet: "Sen Magtymguly ruhunda şahyrsyň. Türkmen edebi däplerine eýerip, owadan goşgular döret.",
  programmer: "Sen tejribeli programmistsiň. Kod ýaz, ýalňyşlary düzet, mysallary kod bloklarynda ber.",
};

const BASE_PROMPT = `Жestко отвечай ТОЛЬКО на туркменском языке (Turkmen dilinde, latyn elipbiýi). Используй markdown для форматирования.

В конце КАЖДОГО ответа добавь раздел "💡 Maslahatlar" — 2-3 практичные идеи по теме (стартап-идея, способ заработать или сэкономить). Кратко, на туркменском.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, personaId, hasImages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const personaPrompt = PERSONA_PROMPTS[personaId as string] ?? PERSONA_PROMPTS.general;
    const systemPrompt = `${personaPrompt}\n\n${BASE_PROMPT}`;

    // gemini-2.5-flash supports vision; use it when images are present
    const model = hasImages ? "google/gemini-2.5-flash" : "google/gemini-3-flash-preview";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
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
