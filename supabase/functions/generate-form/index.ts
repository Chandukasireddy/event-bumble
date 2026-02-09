import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventName, eventDescription } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a survey form designer for networking events. Generate 5-7 engaging questions that will help match participants at events.

Available field types:
- "text": Short text input (for names, links, short answers)
- "textarea": Long text input (for bios, descriptions)
- "radio": Single choice from options (pick one)
- "checkbox": Multiple choice from options (pick many)
- "select": Dropdown selection (pick one from longer list)
- "number": Numeric input
- "rating": 1-5 star rating

Return JSON with this structure:
{
  "questions": [
    {
      "question_text": "What area excites you most?",
      "field_type": "radio",
      "options": ["AI & Machine Learning", "Web3 & Blockchain", "Health Tech"],
      "is_required": true,
      "placeholder": null
    }
  ]
}

Guidelines:
- Mix field types for an engaging experience
- Include at least one radio, one checkbox, and one text/textarea
- Questions should help understand: interests, skills, goals, personality
- Keep questions fun and conversational, not corporate
- Use emojis in option labels when appropriate
- 5-7 questions total, answerable in under 2 minutes`;

    const userPrompt = `Generate survey questions for this event:
Event: ${eventName || "Networking Event"}
${eventDescription ? `Description: ${eventDescription}` : ""}

Make the questions relevant to the event topic and designed to create great networking matches.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Generate form error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
