import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

const BASE_PROMPT = `Отвечай ТОЛЬКО на туркменском языке (Turkmen dilinde, latyn elipbiýi). Используй markdown для форматирования.

В конце КАЖДОГО ответа добавь раздел "💡 Maslahatlar" — 2-3 практичные идеи по теме (стартап-идея, способ заработать или сэкономить). Кратко, на туркменском.`;

// Rate limit constants
const SHORT_WINDOW_MS = 5 * 60 * 1000;
const SHORT_LIMIT = 15;
const LONG_WINDOW_MS = 24 * 60 * 60 * 1000;
const LONG_LIMIT = 100;

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("cf-connecting-ip") || req.headers.get("x-real-ip") || "unknown";
}

async function checkRateLimit(supabase: any, ip: string): Promise<{ ok: boolean; reason?: string }> {
  const now = Date.now();
  const { data: row } = await supabase
    .from("chat_rate_limits")
    .select("*")
    .eq("ip", ip)
    .maybeSingle();

  let shortStart = now;
  let shortCount = 0;
  let longStart = now;
  let longCount = 0;

  if (row) {
    const sStart = new Date(row.short_window_start).getTime();
    const lStart = new Date(row.long_window_start).getTime();
    shortStart = now - sStart > SHORT_WINDOW_MS ? now : sStart;
    shortCount = now - sStart > SHORT_WINDOW_MS ? 0 : row.short_count;
    longStart = now - lStart > LONG_WINDOW_MS ? now : lStart;
    longCount = now - lStart > LONG_WINDOW_MS ? 0 : row.long_count;
  }

  if (shortCount >= SHORT_LIMIT) {
    return { ok: false, reason: "short" };
  }
  if (longCount >= LONG_LIMIT) {
    return { ok: false, reason: "long" };
  }

  await supabase.from("chat_rate_limits").upsert({
    ip,
    short_window_start: new Date(shortStart).toISOString(),
    short_count: shortCount + 1,
    long_window_start: new Date(longStart).toISOString(),
    long_count: longCount + 1,
    updated_at: new Date(now).toISOString(),
  });

  return { ok: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const ip = getClientIp(req);
    const rl = await checkRateLimit(supabase, ip);
    if (!rl.ok) {
      return new Response(
        JSON.stringify({ error: "Rate limited", reason: rl.reason }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { messages, personaId, hasImages } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not configured");

    const personaPrompt = PERSONA_PROMPTS[personaId as string] ?? PERSONA_PROMPTS.general;
    const systemPrompt = `${personaPrompt}\n\n${BASE_PROMPT}`;

    // OpenAI gpt-4o-mini supports vision and text in one model
    const model = "gpt-4o-mini";

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
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
