import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Calendar, MapPin, Users, Copy, ArrowRight, UserCircle, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SparkleIcon } from "@/components/icons/GeometricIcons";
import { NetworkBackground } from "@/components/NetworkBackground";
import { CornerBracket, SectionDivider, MediumSparkle } from "@/components/icons/DecorativeLines";
import { LargeBracket, TitleSparkle, NetworkCluster } from "@/components/BoldDecorations";

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
  share_code: string;
  organizer_code: string;
  networking_duration: number;
  created_at: string;
  creator_name: string | null;
  participant_count?: number;
}

type UserRole = "none" | "organizer" | "participant";

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newEvent, setNewEvent] = useState({
    name: "",
    description: "",
    event_date: "",
    location: "",
    networking_duration: 5,
  });
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Identity state
  const [role, setRole] = useState<UserRole>("none");
  const [userName, setUserName] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [showChangeWarning, setShowChangeWarning] = useState(false);

  // Initialize identity from localStorage
  useEffect(() => {
    const orgName = localStorage.getItem("organizerName");
    if (orgName) {
      setRole("organizer");
      setUserName(orgName);
      return;
    }
    // Check if any participant registrations exist
    const participantEvents = getParticipantEventIds();
    if (participantEvents.length > 0) {
      setRole("participant");
      // Get any participant name from stored data
      const firstKey = `currentUser_${participantEvents[0]}`;
      try {
        const stored = JSON.parse(localStorage.getItem(firstKey) || "{}");
        setUserName(stored.name || "Participant");
      } catch {
        setUserName("Participant");
      }
    }
  }, []);

  // Fetch events when role/userName changes
  useEffect(() => {
    if (role === "organizer" && userName) {
      fetchOrganizerEvents();
    } else if (role === "participant") {
      fetchParticipantEvents();
    }
  }, [role, userName]);

  const getParticipantEventIds = (): string[] => {
    const ids: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith("currentUser_")) {
        const eventId = key.replace("currentUser_", "");
        if (eventId && eventId !== "undefined") {
          ids.push(eventId);
        }
      }
    }
    return ids;
  };

  const fetchOrganizerEvents = async () => {
    setIsLoading(true);
    // Fetch events where creator_name matches OR creator_name is null (legacy)
    const { data: eventsData, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
      return;
    }

    // Filter: show events where creator_name matches (case-insensitive) or is null (legacy)
    const filtered = (eventsData || []).filter((e: any) => {
      if (!e.creator_name) return true; // legacy unclaimed events
      return e.creator_name.toLowerCase() === userName.toLowerCase();
    });

    const eventsWithCounts = await Promise.all(
      filtered.map(async (event: any) => {
        const { count } = await supabase
          .from("registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", event.id);
        return { ...event, participant_count: count || 0 };
      })
    );

    setEvents(eventsWithCounts);
    setIsLoading(false);
  };

  const fetchParticipantEvents = async () => {
    setIsLoading(true);
    const eventIds = getParticipantEventIds();
    
    if (eventIds.length === 0) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    const { data: eventsData, error } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      setIsLoading(false);
      return;
    }

    const eventsWithCounts = await Promise.all(
      (eventsData || []).map(async (event: any) => {
        const { count } = await supabase
          .from("registrations")
          .select("*", { count: "exact", head: true })
          .eq("event_id", event.id);
        return { ...event, participant_count: count || 0 };
      })
    );

    setEvents(eventsWithCounts);
    setIsLoading(false);
  };

  const handleSetOrganizer = () => {
    if (!nameInput.trim()) return;
    localStorage.setItem("organizerName", nameInput.trim());
    setRole("organizer");
    setUserName(nameInput.trim());
    setNameInput("");
  };

  const handleSetParticipant = () => {
    setRole("participant");
    const eventIds = getParticipantEventIds();
    if (eventIds.length > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem(`currentUser_${eventIds[0]}`) || "{}");
        setUserName(stored.name || "Participant");
      } catch {
        setUserName("Participant");
      }
    }
  };

  const handleChangeIdentity = () => {
    if (role === "organizer") {
      setShowChangeWarning(true);
    } else {
      resetIdentity();
    }
  };

  const resetIdentity = () => {
    localStorage.removeItem("organizerName");
    setRole("none");
    setUserName("");
    setEvents([]);
    setShowChangeWarning(false);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name) {
      toast({ title: "Event name required", variant: "destructive" });
      return;
    }

    setIsCreating(true);
    const { error } = await supabase.from("events").insert({
      name: newEvent.name,
      description: newEvent.description || null,
      event_date: newEvent.event_date || null,
      location: newEvent.location || null,
      networking_duration: newEvent.networking_duration,
      creator_name: userName, // Save organizer name
    } as any);

    if (error) {
      toast({ title: "Failed to create event", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event created!", description: "Share the registration link with participants" });
      setShowCreateDialog(false);
      setNewEvent({ name: "", description: "", event_date: "", location: "", networking_duration: 5 });
      fetchOrganizerEvents();
    }
    setIsCreating(false);
  };

  const copyShareLink = (shareCode: string) => {
    const link = `${window.location.origin}/register/${shareCode}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied!", description: link });
  };

  const getEventIndent = (index: number) => {
    const pattern = [24, 120, 48, 100, 32, 96];
    return pattern[index % pattern.length];
  };

  // ─── ROLE SELECTION SCREEN ───
  if (role === "none") {
    return (
      <div className="min-h-screen bg-background">
        <div className="fixed inset-0 z-0 pointer-events-none text-charcoal opacity-[0.25]">
          <NetworkBackground />
        </div>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          <SparkleIcon className="text-primary mb-6" size={48} />
          <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-2 text-center">
            Welcome to MeetSpark
          </h1>
          <p className="text-muted-foreground mb-12 text-center max-w-md">
            How would you like to use the platform?
          </p>

          <div className="grid gap-8 md:grid-cols-2 max-w-2xl w-full">
            {/* Organizer Card */}
            <div className="border border-border/50 p-8 space-y-4">
              <h2 className="font-serif text-xl font-medium text-foreground">I'm an Organizer</h2>
              <p className="text-sm text-muted-foreground">
                Create and manage events, set up matching, share registration links.
              </p>
              <div className="space-y-3 pt-2">
                <Label htmlFor="org-name" className="text-xs font-semibold text-foreground">Your Name</Label>
                <Input
                  id="org-name"
                  placeholder="Enter your name"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSetOrganizer()}
                  className="bg-input border-border focus:border-primary"
                />
                <button
                  onClick={handleSetOrganizer}
                  disabled={!nameInput.trim()}
                  className="text-link-cta group w-full justify-center disabled:opacity-50"
                >
                  Continue as Organizer
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>

            {/* Participant Card */}
            <div className="border border-border/50 p-8 space-y-4">
              <h2 className="font-serif text-xl font-medium text-foreground">I'm a Participant</h2>
              <p className="text-sm text-muted-foreground">
                View events you've registered for, find matches, and connect with others.
              </p>
              <div className="pt-2">
                {getParticipantEventIds().length > 0 ? (
                  <button
                    onClick={handleSetParticipant}
                    className="text-link-cta group w-full justify-center"
                  >
                    View My Events
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    No registrations found. Use an event link to register first.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN DASHBOARD ───
  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-0 z-0 pointer-events-none text-charcoal opacity-[0.25]">
        <NetworkBackground />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="py-6">
          <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <SparkleIcon className="text-primary" size={32} />
              <div>
                <span className="font-serif text-xl text-foreground tracking-tight">
                  Meet<span className="text-primary">Spark</span>
                </span>
                <p className="text-xs text-muted-foreground">
                  {role === "organizer" ? "Organizer Dashboard" : "Participant Dashboard"}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Identity indicator */}
              <div className="flex items-center gap-2 text-sm">
                <UserCircle className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">{userName}</span>
                <button
                  onClick={handleChangeIdentity}
                  className="text-xs text-primary hover:text-primary/80 transition-colors underline"
                >
                  Change
                </button>
              </div>

              {/* Create Event - organizer only */}
              {role === "organizer" && (
                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <button className="text-link-cta group">
                      <Plus className="w-5 h-5" />
                      Create Event
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="font-serif text-foreground">Create New Event</DialogTitle>
                      <DialogDescription>
                        Set up your event and get a shareable registration link
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEvent} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="event-name">Event Name *</Label>
                        <Input
                          id="event-name"
                          placeholder="AI Hackathon Berlin 2025"
                          value={newEvent.name}
                          onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                          className="bg-input border-border focus:border-primary"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-description">Description</Label>
                        <Textarea
                          id="event-description"
                          placeholder="Brief description of your event"
                          value={newEvent.description}
                          onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                          className="bg-input border-border focus:border-primary"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="event-date">Date</Label>
                          <Input
                            id="event-date"
                            type="date"
                            value={newEvent.event_date}
                            onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                            className="bg-input border-border focus:border-primary"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="event-duration">Meeting Duration (min)</Label>
                          <Input
                            id="event-duration"
                            type="number"
                            min="1"
                            max="30"
                            value={newEvent.networking_duration}
                            onChange={(e) => setNewEvent({ ...newEvent, networking_duration: parseInt(e.target.value) || 5 })}
                            className="bg-input border-border focus:border-primary"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="event-location">Location</Label>
                        <Input
                          id="event-location"
                          placeholder="Berlin, Germany"
                          value={newEvent.location}
                          onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                          className="bg-input border-border focus:border-primary"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full text-link-cta justify-center py-4 border-t border-border/50 mt-6"
                      >
                        {isCreating ? "Creating..." : "Create Event →"}
                      </button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </header>

        {/* Change Identity Warning Dialog */}
        <Dialog open={showChangeWarning} onOpenChange={setShowChangeWarning}>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="font-serif text-foreground">Change Identity?</DialogTitle>
              <DialogDescription>
                If you change your name, you'll lose access to events created under "{userName}". 
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setShowChangeWarning(false)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={resetIdentity}
                className="text-link-cta"
              >
                Change Identity
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <main className="container mx-auto px-6 md:px-12 py-12">
          <div className="mb-16 relative">
            <LargeBracket className="hidden md:block absolute -top-8 -right-4 text-charcoal rotate-90" size={150} />
            <NetworkCluster className="hidden lg:block absolute right-32 top-4 text-charcoal" size={80} />
            <div className="flex items-center gap-4 mb-2">
              <MediumSparkle className="text-primary" size={32} />
              <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
                {role === "organizer" ? "Your Events" : "My Events"}
              </h1>
            </div>
            <p className="text-muted-foreground ml-12">
              {role === "organizer"
                ? "Manage events and share registration links"
                : "Events you've registered for"}
            </p>
            <SectionDivider className="mt-10" />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-24">
              <SparkleIcon className="text-muted-foreground mx-auto mb-6" size={48} />
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">
                {role === "organizer" ? "No events yet" : "No events found"}
              </h3>
              <p className="text-muted-foreground mb-8">
                {role === "organizer"
                  ? "Create your first event to get started"
                  : "Register for events using a share link to see them here"}
              </p>
              {role === "organizer" && (
                <button onClick={() => setShowCreateDialog(true)} className="text-link-cta">
                  <Plus className="w-5 h-5" />
                  Create Event
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-0">
              <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-charcoal/30 hidden md:block" />

                {events.map((event, index) => (
                  <div
                    key={event.id}
                    className="py-10 border-b border-border/30 last:border-b-0 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 relative"
                    style={{ paddingLeft: `${getEventIndent(index)}px` }}
                  >
                    <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[5px] w-[11px] h-[11px] rounded-full border-2 border-charcoal/40 bg-background" />

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <TitleSparkle className="text-primary flex-shrink-0" size={20} />
                        <h2 className="font-serif text-xl font-medium text-foreground">{event.name}</h2>
                        {!event.creator_name && role === "organizer" && (
                          <Badge variant="outline" className="text-[10px] border-muted-foreground/30 text-muted-foreground">
                            Unclaimed
                          </Badge>
                        )}
                        <span className="text-xs text-success flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {event.participant_count}
                        </span>
                      </div>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-1 ml-8">{event.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground ml-8">
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
                      </div>
                    </div>

                    <div className="flex gap-4 items-center ml-8 md:ml-0">
                      <button
                        onClick={() => copyShareLink(event.share_code)}
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        Copy Link
                      </button>
                      <Link
                        to={`/event/${event.id}`}
                        className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                      >
                        {role === "organizer" ? "Manage" : "View"}
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
