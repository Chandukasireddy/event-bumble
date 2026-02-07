import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
import { Plus, Calendar, MapPin, Users, Copy, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SparkleIcon } from "@/components/icons/GeometricIcons";

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
  participant_count?: number;
}

export default function Dashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel("events-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, () => {
        fetchEvents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchEvents = async () => {
    const { data: eventsData, error } = await supabase
      .from("events")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching events:", error);
      return;
    }

    // Get participant counts
    const eventsWithCounts = await Promise.all(
      (eventsData || []).map(async (event) => {
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

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEvent.name) {
      toast({
        title: "Event name required",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    const { error } = await supabase.from("events").insert({
      name: newEvent.name,
      description: newEvent.description || null,
      event_date: newEvent.event_date || null,
      location: newEvent.location || null,
      networking_duration: newEvent.networking_duration,
    });

    if (error) {
      toast({
        title: "Failed to create event",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Event created!",
        description: "Share the registration link with participants",
      });
      setShowCreateDialog(false);
      setNewEvent({ name: "", description: "", event_date: "", location: "", networking_duration: 5 });
    }
    setIsCreating(false);
  };

  const copyShareLink = (shareCode: string) => {
    // Use the published URL for public access
    const publishedUrl = "https://event-bumble.lovable.app";
    const link = `${publishedUrl}/register/${shareCode}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link copied!",
      description: link,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative z-10">
        {/* Header - minimal */}
        <header className="py-6">
          <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <SparkleIcon className="text-primary" size={28} />
              <div>
                <span className="font-serif text-xl text-foreground tracking-tight">
                  Meet<span className="text-primary">Spark</span>
                </span>
                <p className="text-xs text-muted-foreground">Organizer Dashboard</p>
              </div>
            </Link>

            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Event
                </Button>
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
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isCreating}>
                    {isCreating ? "Creating..." : "Create Event"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-6 md:px-12 py-12">
          <div className="mb-12">
            <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground mb-2">Your Events</h1>
            <p className="text-muted-foreground">Manage events and share registration links</p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-24">
              <SparkleIcon className="text-muted-foreground mx-auto mb-6" size={48} />
              <h3 className="font-serif text-xl font-medium text-foreground mb-2">No events yet</h3>
              <p className="text-muted-foreground mb-6">Create your first event to get started</p>
              <Button onClick={() => setShowCreateDialog(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              {events.map((event) => (
                <div 
                  key={event.id} 
                  className="py-6 border-b border-border/50 last:border-b-0 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
                >
                  {/* Event info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="font-serif text-xl font-medium text-foreground">{event.name}</h2>
                      <Badge className="bg-success/10 text-success border-0 text-xs px-2 py-0.5">
                        <Users className="w-3 h-3 mr-1" />
                        {event.participant_count}
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-1">{event.description}</p>
                    )}
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
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

                  {/* Actions */}
                  <div className="flex gap-3">
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
                      Manage
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
