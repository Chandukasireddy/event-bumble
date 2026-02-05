import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Zap,
  ArrowLeft,
  Users,
  Code,
  Palette,
  Briefcase,
  MessageSquare,
  Copy,
  Sparkles,
  Calendar,
  MapPin,
  Clock,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ParticipantCard } from "@/components/ParticipantCard";
import { MeetingRequestsList } from "@/components/MeetingRequestsList";
import { AIMatchingPanel } from "@/components/AIMatchingPanel";

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  share_code: string;
  organizer_code: string;
  networking_duration: number;
}

interface Participant {
  id: string;
  name: string;
  role: string;
  interests: string[];
  telegram_handle: string;
  created_at: string;
}

const ROLE_ICONS = {
  Dev: Code,
  Designer: Palette,
  Business: Briefcase,
};

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (eventId) {
      fetchEventData();
    }
  }, [eventId]);

  useEffect(() => {
    if (!eventId) return;

    const channel = supabase
      .channel(`event-${eventId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "registrations", filter: `event_id=eq.${eventId}` },
        () => {
          fetchParticipants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId]);

  const fetchEventData = async () => {
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError || !eventData) {
      console.error("Error fetching event:", eventError);
      setIsLoading(false);
      return;
    }

    setEvent(eventData);
    await fetchParticipants();
    setIsLoading(false);
  };

  const fetchParticipants = async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("event_id", eventId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching participants:", error);
      return;
    }

    setParticipants(data || []);
  };

  const copyShareLink = () => {
    if (!event) return;
    const link = `${window.location.origin}/register/${event.share_code}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: "Share this link with participants",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-foreground mb-4">Event not found</h2>
        <Button asChild variant="outline">
          <Link to="/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="icon">
                <Link to="/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-purple">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h1 className="font-bold text-lg text-foreground">{event.name}</h1>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {event.event_date && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(event.event_date).toLocaleDateString()}
                      </span>
                    )}
                    {event.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {event.networking_duration} min meetings
                    </span>
                  </div>
                </div>
              </div>
              <Button onClick={copyShareLink} variant="outline" className="border-muted-foreground/30">
                <Copy className="w-4 h-4 mr-2" />
                Copy Registration Link
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <Tabs defaultValue="participants" className="space-y-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="participants" className="data-[state=active]:bg-primary/20">
                <Users className="w-4 h-4 mr-2" />
                Participants ({participants.length})
              </TabsTrigger>
              <TabsTrigger value="meetings" className="data-[state=active]:bg-primary/20">
                <MessageSquare className="w-4 h-4 mr-2" />
                Meeting Requests
              </TabsTrigger>
              <TabsTrigger value="ai-match" className="data-[state=active]:bg-primary/20">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Matching
              </TabsTrigger>
            </TabsList>

            <TabsContent value="participants">
              {participants.length === 0 ? (
                <Card className="bg-card/50 border-border">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Users className="w-12 h-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No participants yet</h3>
                    <p className="text-muted-foreground mb-4">Share the registration link to get participants</p>
                    <Button onClick={copyShareLink} className="bg-primary hover:bg-primary/90">
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Registration Link
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {participants.map((participant) => (
                    <ParticipantCard
                      key={participant.id}
                      participant={participant}
                      eventId={event.id}
                      onSelect={() => setSelectedParticipant(participant)}
                      isSelected={selectedParticipant?.id === participant.id}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="meetings">
              <MeetingRequestsList eventId={event.id} participants={participants} />
            </TabsContent>

            <TabsContent value="ai-match">
              <AIMatchingPanel eventId={event.id} participants={participants} />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
