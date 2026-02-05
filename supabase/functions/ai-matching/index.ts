import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface Participant {
  id: string;
  name: string;
  role?: string;
  interests?: string[];
  vibe?: string;
  superpower?: string;
  ideal_copilot?: string;
  offscreen_life?: string;
  bio?: string;
}

interface MatchSuggestion {
  participant1_id: string;
  participant2_id: string;
  reason: string;
  compatibility_score: number;
}

const VIBE_LABELS: Record<string, string> = {
  productivity: "Productivity & Automation",
  creative: "Creative Arts",
  health: "Health & Wellness",
  social: "Social Impact",
  knowledge: "Knowledge & Second Brains",
  fintech: "FinTech & Money",
  education: "Education & Jobs",
  shopping: "Shopping & Retail",
  infrastructure: "Infrastructure",
  gaming: "Gaming & Entertainment",
};

const SUPERPOWER_LABELS: Record<string, string> = {
  builds: "Builder (code & technical)",
  shapes: "Shaper (design & UX)",
  plans: "Planner (strategy & market fit)",
  speaks: "Speaker (story & pitch)",
};

const COPILOT_LABELS: Record<string, string> = {
  technical: "Technical Engine",
  creative: "Creative Spark",
  strategic: "Strategic Guide",
  doer: "High-Speed Doer",
  thinker: "Deep Thinker",
};

const OFFSCREEN_LABELS: Record<string, string> = {
  outdoor: "Outdoor (hiking/cycling)",
  city: "City explorer (galleries/music/food)",
  home: "Home cook/host",
  gaming: "Gamer/sports enthusiast",
};

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

    // Build participant summary for AI with new matching fields
    const participantSummary = participants
      .map((p) => {
        const parts = [`- ${p.name} (ID: ${p.id})`];
        if (p.vibe) parts.push(`  Passion: ${VIBE_LABELS[p.vibe] || p.vibe}`);
        if (p.superpower) parts.push(`  Superpower: ${SUPERPOWER_LABELS[p.superpower] || p.superpower}`);
        if (p.ideal_copilot) parts.push(`  Looking for: ${COPILOT_LABELS[p.ideal_copilot] || p.ideal_copilot}`);
        if (p.offscreen_life) parts.push(`  Off-screen: ${OFFSCREEN_LABELS[p.offscreen_life] || p.offscreen_life}`);
        if (p.bio) parts.push(`  Bio: "${p.bio}"`);
        return parts.join("\n");
      })
      .join("\n\n");

    const systemPrompt = `You are a fun, enthusiastic AI matchmaker for networking events! Your job is to connect people based on their passions, skills, and what they're looking for.

MATCHING CRITERIA (in order of importance):
1. **Give-Get Match**: Match people whose "Superpower" (what they offer) aligns with what the other person is "Looking for" (their ideal co-pilot)
2. **Shared Vibe**: People passionate about similar areas often click
3. **Complementary Skills**: A Builder + Designer, or a Planner + Doer can create magic
4. **Lifestyle Match**: Similar off-screen interests = easy conversation starters

${currentUser ? `🎯 FOCUS ON: ${currentUser.name} (ID: ${currentUser.id}). Generate matches specifically FOR this person. At least 2-3 suggestions MUST include them.` : ''}

Return JSON with this structure:
{
  "suggestions": [
    {
      "participant1_id": "id",
      "participant2_id": "id",
      "reason": "Make this fun, conversational, and specific! E.g., 'You both geek out about FinTech, and Sarah's design magic could bring your backend skills to life! 🚀'",
      "compatibility_score": 0.85
    }
  ]
}

Generate 3-5 matches. Use emojis. Be enthusiastic! Make people excited to meet each other.`;

    const userPrompt = `Here are the participants:

${participantSummary}

${currentUser 
  ? `Find the BEST matches for ${currentUser.name}!
Their vibe: ${VIBE_LABELS[currentUser.vibe || ''] || 'Not specified'}
Their superpower: ${SUPERPOWER_LABELS[currentUser.superpower || ''] || 'Not specified'}
They're looking for: ${COPILOT_LABELS[currentUser.ideal_copilot || ''] || 'Not specified'}
${currentUser.bio ? `About them: "${currentUser.bio}"` : ''}`
  : 'Generate the best networking matches for this event!'
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
