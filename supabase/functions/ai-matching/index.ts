import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Participant {
  id: string;
  name: string;
  role: string;
  interests: string[];
}

interface MatchSuggestion {
  participant1_id: string;
  participant2_id: string;
  reason: string;
  compatibility_score: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { eventId, participants, currentUserId } = await req.json() as {
      eventId: string;
      participants: Participant[];
      currentUserId?: string;
    };

    if (!participants || participants.length < 2) {
      return new Response(
        JSON.stringify({ error: "At least 2 participants required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Find current user if provided
    const currentUser = currentUserId 
      ? participants.find(p => p.id === currentUserId)
      : null;

    // Build participant summary for AI
    const participantSummary = participants
      .map((p) => `- ${p.name} (ID: ${p.id}, Role: ${p.role}): Interests: ${p.interests.join(", ")}`)
      .join("\n");

    const systemPrompt = `You are an AI networking assistant for hackathon events. Your job is to analyze participant profiles and suggest optimal matches for productive networking conversations.

Consider:
1. Complementary skills (e.g., Developer + Designer, Business + Technical)
2. Shared interests that could lead to collaboration
3. Potential for interesting cross-disciplinary discussions
4. Balance between similarity (shared interests) and diversity (different perspectives)

${currentUser ? `IMPORTANT: The current user is ${currentUser.name} (ID: ${currentUser.id}). Prioritize finding matches FOR THIS USER specifically. At least 2-3 of your suggestions should include ${currentUser.name}.` : ''}

Return matches as JSON with this exact structure:
{
  "suggestions": [
    {
      "participant1_id": "id",
      "participant2_id": "id", 
      "reason": "Brief, friendly explanation of why this is a good match. Be conversational and mention specific shared interests or complementary skills.",
      "compatibility_score": 0.85
    }
  ]
}

Generate 3-5 diverse match suggestions. compatibility_score should be 0.0-1.0. Make reasons personal and engaging!`;

    const userPrompt = `Here are the event participants:

${participantSummary}

${currentUser 
  ? `Please find great networking matches for ${currentUser.name} (${currentUser.role}) who is interested in: ${currentUser.interests.join(", ")}`
  : 'Generate match suggestions for optimal networking at this hackathon event.'
}`;

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
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded, please try again later" }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted, please add more credits" }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    let suggestions: MatchSuggestion[];
    try {
      const parsed = JSON.parse(content);
      suggestions = parsed.suggestions || [];
    } catch {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response");
    }

    // Validate participant IDs
    const participantIds = new Set(participants.map((p) => p.id));
    suggestions = suggestions.filter(
      (s) => participantIds.has(s.participant1_id) && participantIds.has(s.participant2_id)
    );

    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("AI matching error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
