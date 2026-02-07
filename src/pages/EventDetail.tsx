import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  Copy,
  Calendar,
  MapPin,
  Clock,
  Search,
  ArrowRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from "@/hooks/useNotifications";
import { ParticipantCard } from "@/components/ParticipantCard";
import { MeetingRequestsList } from "@/components/MeetingRequestsList";
import { AIMatchingPanel } from "@/components/AIMatchingPanel";
import { SparkleIcon, OverlappingCirclesIcon } from "@/components/icons/GeometricIcons";
import { NetworkBackground } from "@/components/NetworkBackground";
import { CornerBracketFlipped, MediumSparkle } from "@/components/icons/DecorativeLines";
import { LargeBracketFlipped, TitleSparkle, NetworkCluster } from "@/components/BoldDecorations";

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
  vibe?: string;
  superpower?: string;
  ideal_copilot?: string;
  offscreen_life?: string;
  bio?: string;
  how_to_find_me?: string;
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

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const { unreadCounts, markRequestSeen, markMessagesRead, refreshCounts } = useNotifications(eventId || "", currentUser?.id);

  // Load current user from localStorage
  useEffect(() => {
    if (eventId) {
      const stored = localStorage.getItem(`currentUser_${eventId}`);
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse current user:", e);
        }
      }
    }
  }, [eventId]);

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

  // Dramatic zig-zag indent pattern for participants
  const getParticipantIndent = (index: number) => {
    const pattern = [0, 80, 24, 100, 40, 72];
    return pattern[index % pattern.length];
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
        <h2 className="font-serif text-xl font-medium text-foreground mb-4">Event not found</h2>
        <Link 
          to="/dashboard"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const filteredParticipants = participants.filter((p) => {
    const query = searchQuery.toLowerCase();
    return (
      p.name.toLowerCase().includes(query) ||
      p.role.toLowerCase().includes(query) ||
      p.interests.some((i) => i.toLowerCase().includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Network Background - BOLD 25% opacity */}
      <div className="fixed inset-0 z-0 pointer-events-none text-charcoal opacity-[0.25]">
        <NetworkBackground />
      </div>

      <div className="relative z-10">
        {/* Header - minimal */}
        <header className="py-6">
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex items-center gap-4">
              <Link 
                to="/dashboard"
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div className="flex items-center gap-3 flex-1">
                <SparkleIcon className="text-primary" size={24} />
                <TitleSparkle className="text-primary hidden md:block" size={16} />
                <div className="flex-1">
                  <h1 className="font-serif text-xl font-medium text-foreground">{event.name}</h1>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
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
              {/* Copy Link as icon-only action */}
              <button 
                onClick={copyShareLink} 
                className="text-muted-foreground hover:text-foreground transition-colors p-2"
                title="Copy registration link"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 md:px-12 py-8 relative">
          {/* LARGE decorative corner bracket - bottom right */}
          <LargeBracketFlipped 
            className="hidden md:block absolute bottom-4 right-4 text-charcoal" 
            size={120} 
          />
          {/* Network cluster decoration */}
          <NetworkCluster 
            className="hidden lg:block absolute right-24 top-20 text-charcoal" 
            size={70} 
          />
          
          <Tabs defaultValue="ai-match" className="space-y-8">
            <TabsList className="bg-transparent border-b border-border/50 rounded-none w-full justify-start gap-6 p-0 h-auto">
              <TabsTrigger 
                value="ai-match" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground"
              >
                <OverlappingCirclesIcon className="w-4 h-4 mr-2" size={16} />
                AI Matching
              </TabsTrigger>
              <TabsTrigger 
                value="meetings" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground relative"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Requests
                {(unreadCounts.pendingRequests + unreadCounts.unreadMessages) > 0 && (
                  <span className="absolute -top-1 -right-3 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadCounts.pendingRequests + unreadCounts.unreadMessages}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger 
                value="participants" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none px-0 pb-3 text-muted-foreground data-[state=active]:text-foreground"
              >
                <Users className="w-4 h-4 mr-2" />
                Participants ({participants.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai-match" className="mt-8">
              <AIMatchingPanel eventId={event.id} participants={participants} currentUser={currentUser} />
            </TabsContent>

            <TabsContent value="meetings" className="mt-8">
              <MeetingRequestsList 
                eventId={event.id} 
                participants={participants} 
                currentUserId={currentUser?.id}
                onMarkRequestSeen={markRequestSeen}
                onMarkMessagesRead={markMessagesRead}
              />
            </TabsContent>

            <TabsContent value="participants" className="mt-8">
              {participants.length === 0 ? (
                <div className="text-center py-24">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-medium text-foreground mb-2">No participants yet</h3>
                  <p className="text-muted-foreground mb-8">Share the registration link to get participants</p>
                  <button 
                    onClick={copyShareLink} 
                    className="text-link-cta"
                  >
                    <Copy className="w-5 h-5" />
                    Copy Registration Link
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Search Input */}
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, role, or interests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-transparent border-border focus:border-primary"
                    />
                  </div>
                  
                  {/* Filtered Participants List with DRAMATIC zig-zag indents */}
                  {filteredParticipants.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No participants found matching "{searchQuery}"
                    </div>
                  ) : (
                    <div className="space-y-0 relative">
                      {/* Bold vertical timeline */}
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-charcoal/25 hidden md:block" />
                      
                      {filteredParticipants.map((participant, index) => (
                        <div 
                          key={participant.id}
                          className="relative py-2"
                          style={{ paddingLeft: `${getParticipantIndent(index)}px` }}
                        >
                          {/* Timeline node */}
                          <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] w-[11px] h-[11px] rounded-full border-2 border-charcoal/30 bg-background" />
                          <ParticipantCard
                            participant={participant}
                            eventId={event.id}
                            currentUserId={currentUser?.id}
                            compact
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}