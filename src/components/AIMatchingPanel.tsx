import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Zap, Code, Palette, Briefcase, ArrowRight, RefreshCw, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { OverlappingCirclesIcon, SparkleIcon } from "@/components/icons/GeometricIcons";
import { MediumSparkle } from "@/components/icons/DecorativeLines";
import { TitleSparkle } from "@/components/BoldDecorations";

const ROLE_ICONS = {
  Dev: Code,
  Designer: Palette,
  Business: Briefcase,
};

const SUPERPOWER_LABELS: Record<string, string> = {
  builds: "💻 Builder",
  shapes: "🎨 Shaper",
  plans: "📈 Planner",
  speaks: "🗣️ Speaker",
};

const VIBE_LABELS: Record<string, string> = {
  productivity: "⚡ Productivity",
  creative: "🎨 Creative Arts",
  health: "🏥 Health",
  social: "🌍 Social Impact",
  knowledge: "🧠 Knowledge",
  fintech: "💰 FinTech",
  education: "💼 Education",
  shopping: "🛒 Shopping",
  infrastructure: "🛠️ Infrastructure",
  gaming: "🎮 Gaming",
};

interface Participant {
  id: string;
  name: string;
  role: string;
  interests: string[];
  telegram_handle: string;
  vibe?: string;
  superpower?: string;
  ideal_copilot?: string;
  offscreen_life?: string;
  bio?: string;
}

interface CurrentUser {
  id: string;
  name: string;
  vibe?: string;
  superpower?: string;
  idealCopilot?: string;
  offscreenLife?: string;
  bio?: string;
}

interface MatchSuggestion {
  participant1: Participant;
  participant2: Participant;
  reason: string;
  compatibility_score: number;
}

interface AIMatchingPanelProps {
  eventId: string;
  participants: Participant[];
  currentUser: CurrentUser | null;
}

export function AIMatchingPanel({ eventId, participants, currentUser }: AIMatchingPanelProps) {
  const storageKey = `ai-matches-${eventId}-${currentUser?.id || 'anon'}`;
  
  // Track participants we already have requests with
  const [existingRequestIds, setExistingRequestIds] = useState<Set<string>>(new Set());
  
  // Fetch existing meeting requests for current user
  useEffect(() => {
    const fetchExistingRequests = async () => {
      if (!currentUser?.id) return;
      
      const { data } = await supabase
        .from("meeting_requests")
        .select("requester_id, target_id, status")
        .eq("event_id", eventId)
        .or(`requester_id.eq.${currentUser.id},target_id.eq.${currentUser.id}`)
        .in("status", ["pending", "accepted"]);
      
      if (data) {
        const ids = new Set<string>();
        data.forEach((req) => {
          if (req.requester_id === currentUser.id) {
            ids.add(req.target_id);
          } else {
            ids.add(req.requester_id);
          }
        });
        setExistingRequestIds(ids);
      }
    };
    
    fetchExistingRequests();
    
    // Subscribe to meeting request changes
    const channel = supabase
      .channel(`ai-panel-requests-${eventId}-${currentUser?.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meeting_requests", filter: `event_id=eq.${eventId}` },
        () => fetchExistingRequests()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, currentUser?.id]);
  
  // Initialize state from localStorage
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((s: any) => ({
          ...s,
          participant1: participants.find(p => p.id === s.participant1Id) || s.participant1,
          participant2: participants.find(p => p.id === s.participant2Id) || s.participant2,
        })).filter((s: MatchSuggestion) => s.participant1 && s.participant2);
      }
    } catch (e) {
      console.error("Error loading stored matches:", e);
    }
    return [];
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(() => {
    try {
      return localStorage.getItem(storageKey) !== null;
    } catch {
      return false;
    }
  });
  const { toast } = useToast();

  // Persist suggestions to localStorage whenever they change
  useEffect(() => {
    if (suggestions.length > 0) {
      const toStore = suggestions.map(s => ({
        ...s,
        participant1Id: s.participant1.id,
        participant2Id: s.participant2.id,
      }));
      localStorage.setItem(storageKey, JSON.stringify(toStore));
    }
  }, [suggestions, storageKey]);

  const generateMatches = async () => {
    // Filter out participants we already have requests with
    const availableParticipants = participants.filter(
      p => p.id !== currentUser?.id && !existingRequestIds.has(p.id)
    );
    
    if (availableParticipants.length < 1) {
      toast({
        title: "No new matches available",
        description: "You already have requests with all participants",
        variant: "destructive",
      });
      return;
    }

    if (participants.length < 2) {
      toast({
        title: "Not enough participants",
        description: "You need at least 2 participants to generate matches",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const targetUser = currentUser 
        ? participants.find(p => p.id === currentUser.id) || { ...currentUser, telegram_handle: "" }
        : null;

      const participantsForAI = currentUser 
        ? [participants.find(p => p.id === currentUser.id), ...availableParticipants].filter(Boolean)
        : participants;

      const { data, error } = await supabase.functions.invoke("ai-matching", {
        body: {
          eventId,
          participants: participantsForAI.map((p) => ({
            id: p!.id,
            name: p!.name,
            role: p!.role,
            interests: p!.interests,
            vibe: p!.vibe,
            superpower: p!.superpower,
            ideal_copilot: p!.ideal_copilot,
            offscreen_life: p!.offscreen_life,
            bio: p!.bio,
          })),
          currentUserId: currentUser?.id,
        },
      });

      if (error) throw error;

      if (data?.suggestions) {
        let mappedSuggestions: MatchSuggestion[] = data.suggestions.map(
          (s: { participant1_id: string; participant2_id: string; reason: string; compatibility_score: number }) => ({
            participant1: participants.find((p) => p.id === s.participant1_id)!,
            participant2: participants.find((p) => p.id === s.participant2_id)!,
            reason: s.reason,
            compatibility_score: s.compatibility_score,
          })
        ).filter((s: MatchSuggestion) => s.participant1 && s.participant2);

        if (currentUser) {
          mappedSuggestions = mappedSuggestions.sort((a, b) => {
            const aHasUser = a.participant1.id === currentUser.id || a.participant2.id === currentUser.id;
            const bHasUser = b.participant1.id === currentUser.id || b.participant2.id === currentUser.id;
            if (aHasUser && !bHasUser) return -1;
            if (!aHasUser && bHasUser) return 1;
            return b.compatibility_score - a.compatibility_score;
          });
        }

        setSuggestions(mappedSuggestions);
        setHasGenerated(true);
        toast({
          title: currentUser ? `Hey ${currentUser.name}! 🎉` : "Matches generated!",
          description: `Found ${mappedSuggestions.length} great connections for you`,
        });
      }
    } catch (error) {
      console.error("Error generating matches:", error);
      if (currentUser && participants.length >= 2) {
        const fallbackMatches = generateFallbackMatches();
        if (fallbackMatches.length > 0) {
          setSuggestions(fallbackMatches);
          setHasGenerated(true);
          toast({
            title: `Welcome ${currentUser.name}! ✨`,
            description: "Here are some people you should meet!",
          });
          return;
        }
      }
      toast({
        title: "Failed to generate matches",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateFallbackMatches = (): MatchSuggestion[] => {
    if (!currentUser) return [];
    
    const otherParticipants = participants.filter(
      p => p.id !== currentUser.id && !existingRequestIds.has(p.id)
    );
    if (otherParticipants.length === 0) return [];

    const funReasons = [
      "Both of you are here to network - that's already something in common! 🤝",
      "Sometimes the best connections happen by chance! ✨",
      "You never know where a conversation might lead! 🚀",
      "Different backgrounds often spark the best ideas! 💡",
      "Every great partnership starts with a simple hello! 👋",
    ];

    const shuffled = [...otherParticipants].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(3, shuffled.length));

    const currentParticipant = participants.find(p => p.id === currentUser.id) || {
      ...currentUser,
      telegram_handle: "",
    };

    return selected.map((p, i) => ({
      participant1: currentParticipant as Participant,
      participant2: p,
      reason: funReasons[i % funReasons.length],
      compatibility_score: 0.5 + Math.random() * 0.3,
    }));
  };

  const createMeetingFromSuggestion = async (suggestion: MatchSuggestion) => {
    try {
      const { error } = await supabase.from("meeting_requests").insert({
        event_id: eventId,
        requester_id: suggestion.participant1.id,
        target_id: suggestion.participant2.id,
        message: suggestion.reason,
        is_ai_suggested: true,
      });

      if (error) throw error;

      toast({
        title: "Meeting request created!",
        description: `Sent to ${suggestion.participant1.name} and ${suggestion.participant2.name}`,
      });

      const newSuggestions = suggestions.filter((s) => s !== suggestion);
      setSuggestions(newSuggestions);
      if (newSuggestions.length === 0) {
        localStorage.removeItem(storageKey);
      }
    } catch (error) {
      toast({
        title: "Failed to create meeting",
        variant: "destructive",
      });
    }
  };

  const RoleIcon1 = (role: string) => ROLE_ICONS[role as keyof typeof ROLE_ICONS] || Code;

  const filteredSuggestions = suggestions.filter(s => {
    if (!currentUser) return true;
    const otherPersonId = s.participant1.id === currentUser.id ? s.participant2.id : s.participant1.id;
    return !existingRequestIds.has(otherPersonId);
  });

  return (
    <div className="space-y-12">
      {/* Personalized Greeting - minimal */}
      {currentUser && (
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-serif text-xl font-medium text-foreground">
              Welcome, {currentUser.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Let's find you some great connections
            </p>
          </div>
        </div>
      )}

      {/* Generate Button - as text link CTA */}
      <div className="text-center py-8">
        <OverlappingCirclesIcon className="text-charcoal mx-auto mb-6" size={48} />
        <h2 className="font-serif text-2xl font-medium text-foreground mb-2">
          AI-Powered Matching
        </h2>
        <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
          {currentUser 
            ? `Finding the best people for you to meet at this event`
            : `Let AI analyze participant profiles and suggest optimal networking pairs`
          }
        </p>
        
        {/* Text link CTA instead of button */}
        <button
          onClick={generateMatches}
          disabled={isLoading || participants.length < 2}
          className="text-link-cta group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin" />
              Finding your matches...
            </>
          ) : hasGenerated ? (
            <>
              <RefreshCw className="w-5 h-5" />
              Find More Matches
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          ) : (
            <>
              <SparkleIcon className="text-primary" size={20} />
              {currentUser ? "Find My Matches" : "Generate AI Matches"}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
        
        <p className="text-xs text-muted-foreground mt-4">
          {currentUser 
            ? `${participants.filter(p => p.id !== currentUser.id && !existingRequestIds.has(p.id)).length} people available`
            : `${participants.length} participants`
          }
        </p>
      </div>

      {/* Suggestions - free-flowing list with DRAMATIC zig-zag indents */}
      {filteredSuggestions.length > 0 && (
        <div className="space-y-8">
          <div className="flex items-center gap-3 justify-center">
            <MediumSparkle className="text-primary" size={28} />
            <h3 className="font-serif text-xl font-medium text-foreground">
              {currentUser ? "Your Recommended Connections" : "Suggested Matches"}
            </h3>
          </div>
          
          <div className="space-y-0 relative">
            {/* Bold vertical timeline */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-charcoal/25 hidden md:block" />
            
            {filteredSuggestions.map((suggestion, index) => {
              const Icon1 = RoleIcon1(suggestion.participant1.role);
              const Icon2 = RoleIcon1(suggestion.participant2.role);
              const isYourMatch = currentUser && 
                (suggestion.participant1.id === currentUser.id || suggestion.participant2.id === currentUser.id);
              const otherPerson = currentUser 
                ? (suggestion.participant1.id === currentUser.id ? suggestion.participant2 : suggestion.participant1)
                : null;
              
              // Dramatic zig-zag indent pattern
              const indentPattern = [24, 100, 48, 80, 32, 96];
              const indent = indentPattern[index % indentPattern.length];

              return (
                <div 
                  key={index} 
                  className="py-8 border-b border-border/30 last:border-b-0 relative"
                  style={{ paddingLeft: `${indent}px` }}
                >
                  {/* Timeline node */}
                  <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] w-[11px] h-[11px] rounded-full border-2 border-charcoal/30 bg-background" />
                  
                  {isYourMatch && otherPerson ? (
                    // Personalized view
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <TitleSparkle className="text-primary flex-shrink-0" size={18} />
                          <Icon2 className="w-5 h-5 text-primary" />
                          <span className="font-serif text-lg font-medium text-foreground">
                            {otherPerson.name}
                          </span>
                          <span className="text-xs font-medium text-success">
                            {Math.round(suggestion.compatibility_score * 100)}% match
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {otherPerson.superpower && (
                            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                              {SUPERPOWER_LABELS[otherPerson.superpower] || otherPerson.superpower}
                            </Badge>
                          )}
                          {otherPerson.vibe && (
                            <Badge variant="outline" className="text-xs border-border text-muted-foreground">
                              {VIBE_LABELS[otherPerson.vibe] || otherPerson.vibe}
                            </Badge>
                          )}
                        </div>
                        
                        {otherPerson.bio && (
                          <p className="text-sm text-muted-foreground font-serif italic mb-3">
                            "{otherPerson.bio.slice(0, 100)}{otherPerson.bio.length > 100 ? '...' : ''}"
                          </p>
                        )}
                        
                        <p className="text-sm text-muted-foreground">
                          {suggestion.reason}
                        </p>
                      </div>
                      
                      {/* Text link CTA */}
                      <button
                        onClick={() => createMeetingFromSuggestion(suggestion)}
                        className="text-link-cta group whitespace-nowrap"
                      >
                        Request to Meet
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  ) : (
                    // Standard view
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Icon1 className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">{suggestion.participant1.name}</span>
                          <span className="text-muted-foreground">×</span>
                          <Icon2 className="w-4 h-4 text-primary" />
                          <span className="font-medium text-foreground">{suggestion.participant2.name}</span>
                          <span className="text-xs font-medium text-success ml-2">
                            {Math.round(suggestion.compatibility_score * 100)}%
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground font-serif italic">
                          "{suggestion.reason}"
                        </p>
                      </div>
                      
                      <button
                        onClick={() => createMeetingFromSuggestion(suggestion)}
                        className="text-sm text-primary hover:underline flex items-center gap-1"
                      >
                        Create Meeting
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* No suggestions state */}
      {hasGenerated && filteredSuggestions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {existingRequestIds.size > 0 
              ? "You've already connected with all your matches! Find more below."
              : "No matches found yet. Try generating again!"}
          </p>
          <button
            onClick={generateMatches}
            disabled={isLoading}
            className="text-sm text-primary hover:underline flex items-center gap-1 mx-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Find More Matches
          </button>
        </div>
      )}
    </div>
  );
}
