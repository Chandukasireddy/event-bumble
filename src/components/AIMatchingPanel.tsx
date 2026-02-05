import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Zap, Code, Palette, Briefcase, ArrowRight, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ROLE_ICONS = {
  Dev: Code,
  Designer: Palette,
  Business: Briefcase,
};

interface Participant {
  id: string;
  name: string;
  role: string;
  interests: string[];
  telegram_handle: string;
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
}

export function AIMatchingPanel({ eventId, participants }: AIMatchingPanelProps) {
  const [suggestions, setSuggestions] = useState<MatchSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const { toast } = useToast();

  const generateMatches = async () => {
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
      const { data, error } = await supabase.functions.invoke("ai-matching", {
        body: {
          eventId,
          participants: participants.map((p) => ({
            id: p.id,
            name: p.name,
            role: p.role,
            interests: p.interests,
          })),
        },
      });

      if (error) throw error;

      if (data?.suggestions) {
        const mappedSuggestions: MatchSuggestion[] = data.suggestions.map(
          (s: { participant1_id: string; participant2_id: string; reason: string; compatibility_score: number }) => ({
            participant1: participants.find((p) => p.id === s.participant1_id)!,
            participant2: participants.find((p) => p.id === s.participant2_id)!,
            reason: s.reason,
            compatibility_score: s.compatibility_score,
          })
        ).filter((s: MatchSuggestion) => s.participant1 && s.participant2);

        setSuggestions(mappedSuggestions);
        setHasGenerated(true);
        toast({
          title: "Matches generated!",
          description: `Found ${mappedSuggestions.length} great matches`,
        });
      }
    } catch (error) {
      console.error("Error generating matches:", error);
      toast({
        title: "Failed to generate matches",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

      // Remove from suggestions
      setSuggestions(suggestions.filter((s) => s !== suggestion));
    } catch (error) {
      toast({
        title: "Failed to create meeting",
        variant: "destructive",
      });
    }
  };

  const RoleIcon1 = (role: string) => ROLE_ICONS[role as keyof typeof ROLE_ICONS] || Code;

  return (
    <div className="space-y-6">
      {/* Generate Button */}
      <Card className="bg-card/50 border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            AI-Powered Matching
          </CardTitle>
          <CardDescription>
            Let AI analyze participant profiles and suggest optimal networking pairs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={generateMatches}
            disabled={isLoading || participants.length < 2}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground glow-green"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Analyzing participants...
              </>
            ) : hasGenerated ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Matches
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 mr-2" />
                Generate AI Matches
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            {participants.length} participants available for matching
          </p>
        </CardContent>
      </Card>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Suggested Matches</h3>
          {suggestions.map((suggestion, index) => {
            const Icon1 = RoleIcon1(suggestion.participant1.role);
            const Icon2 = RoleIcon1(suggestion.participant2.role);

            return (
              <Card key={index} className="bg-card/50 border-border hover:border-accent/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon1 className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{suggestion.participant1.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.participant1.role}
                        </Badge>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                      <div className="flex items-center gap-2">
                        <Icon2 className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">{suggestion.participant2.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.participant2.role}
                        </Badge>
                      </div>
                    </div>
                    <Badge className="bg-accent/20 text-accent">
                      {Math.round(suggestion.compatibility_score * 100)}% match
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4 bg-secondary/50 p-3 rounded-lg">
                    <Sparkles className="w-4 h-4 inline mr-2 text-accent" />
                    {suggestion.reason}
                  </p>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 border-muted-foreground/30"
                      onClick={() => setSuggestions(suggestions.filter((s) => s !== suggestion))}
                    >
                      Dismiss
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => createMeetingFromSuggestion(suggestion)}
                    >
                      Create Meeting Request
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {hasGenerated && suggestions.length === 0 && (
        <Card className="bg-card/50 border-border">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Sparkles className="w-8 h-8 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">All suggestions have been used or dismissed</p>
            <Button
              variant="link"
              onClick={generateMatches}
              className="text-primary mt-2"
            >
              Generate new matches
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
