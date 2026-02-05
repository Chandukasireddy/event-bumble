import { useState, useEffect } from "react";
import { RegistrationForm } from "@/components/RegistrationForm";
import { WaitingState } from "@/components/WaitingState";
import { MatchCard } from "@/components/MatchCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Zap, Settings2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

type AppState = "register" | "waiting" | "matched";

interface MatchData {
  name: string;
  role: string;
  summary: string;
  telegramHandle: string;
}

export default function Index() {
  const [appState, setAppState] = useState<AppState>("register");
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Listen for match updates via realtime
  useEffect(() => {
    if (!registrationId || appState !== "waiting") return;

    const channel = supabase
      .channel(`registration-${registrationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "registrations",
          filter: `id=eq.${registrationId}`,
        },
        async (payload) => {
          const updated = payload.new as { match_id: string | null };
          if (updated.match_id) {
            // Fetch match details
            const { data: matchRecord } = await supabase
              .from("matches")
              .select("*")
              .eq("id", updated.match_id)
              .single();

            if (matchRecord) {
              const { data: matchedPerson } = await supabase
                .from("registrations")
                .select("*")
                .eq("id", matchRecord.matched_registration_id)
                .single();

              if (matchedPerson) {
                setMatchData({
                  name: matchedPerson.name,
                  role: matchedPerson.role,
                  summary: matchRecord.match_summary,
                  telegramHandle: matchedPerson.telegram_handle,
                });
                setAppState("matched");
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [registrationId, appState]);

  const handleRegistrationSuccess = (id: string) => {
    setRegistrationId(id);
    setAppState("waiting");
  };

  const handleReset = () => {
    setAppState("register");
    setRegistrationId(null);
    setMatchData(null);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-purple">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">Event Matchmaker</h1>
                <p className="text-xs text-muted-foreground">AI Hackathon Berlin</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 container mx-auto px-4 py-8 md:py-12 flex flex-col items-center justify-center">
          <div className="w-full max-w-md">
            {appState === "register" && (
              <div className="space-y-8">
                {/* Intro text */}
                <div className="text-center space-y-2">
                  <h2 className="text-2xl md:text-3xl font-bold text-gradient">
                    Find Your Dream Team
                  </h2>
                  <p className="text-muted-foreground">
                    AI-powered matching to connect you with the perfect hackathon collaborators
                  </p>
                </div>

                {/* Registration form */}
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border p-6">
                  <RegistrationForm
                    webhookUrl={webhookUrl}
                    onSubmitSuccess={handleRegistrationSuccess}
                  />
                </div>

                {/* Webhook settings */}
                <Collapsible open={showSettings} onOpenChange={setShowSettings}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full text-muted-foreground hover:text-foreground"
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      {showSettings ? "Hide" : "Show"} Webhook Settings
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="pt-4">
                    <div className="bg-muted/50 rounded-lg p-4 border border-border space-y-2">
                      <Label htmlFor="webhook" className="text-sm text-muted-foreground">
                        Activepieces Webhook URL
                      </Label>
                      <Input
                        id="webhook"
                        placeholder="https://cloud.activepieces.com/api/v1/webhooks/..."
                        value={webhookUrl}
                        onChange={(e) => setWebhookUrl(e.target.value)}
                        className="bg-secondary border-border text-sm"
                      />
                      <p className="text-xs text-muted-foreground">
                        Registrations will be sent to this webhook for processing
                      </p>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}

            {appState === "waiting" && <WaitingState />}

            {appState === "matched" && matchData && (
              <MatchCard
                matchName={matchData.name}
                matchRole={matchData.role}
                matchSummary={matchData.summary}
                telegramHandle={matchData.telegramHandle}
                onReset={handleReset}
              />
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/50 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4 text-center">
            <p className="text-xs text-muted-foreground">
              Built with 💜 for AI Hackathon Berlin
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
