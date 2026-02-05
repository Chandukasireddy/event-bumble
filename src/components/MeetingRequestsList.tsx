import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, MessageSquare, Sparkles, Send, MapPin, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MeetingChat } from "./MeetingChat";
interface Participant {
  id: string;
  name: string;
  role: string;
  interests: string[];
  telegram_handle: string;
  how_to_find_me?: string;
}

interface MeetingRequest {
  id: string;
  requester_id: string;
  target_id: string;
  status: string;
  message: string | null;
  is_ai_suggested: boolean;
  suggested_time: string | null;
  created_at: string;
}

interface MeetingRequestsListProps {
  eventId: string;
  participants: Participant[];
  currentUserId?: string;
}

export function MeetingRequestsList({ eventId, participants, currentUserId }: MeetingRequestsListProps) {
  const [receivedRequests, setReceivedRequests] = useState<MeetingRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<MeetingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openChatId, setOpenChatId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel(`meeting-requests-${eventId}-${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meeting_requests", filter: `event_id=eq.${eventId}` },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [eventId, currentUserId]);

  const fetchRequests = async () => {
    if (!currentUserId) {
      setReceivedRequests([]);
      setSentRequests([]);
      setIsLoading(false);
      return;
    }

    // Fetch received requests (where I am the target)
    const { data: received, error: receivedError } = await supabase
      .from("meeting_requests")
      .select("*")
      .eq("event_id", eventId)
      .eq("target_id", currentUserId)
      .order("created_at", { ascending: false });

    // Fetch sent requests (where I am the requester)
    const { data: sent, error: sentError } = await supabase
      .from("meeting_requests")
      .select("*")
      .eq("event_id", eventId)
      .eq("requester_id", currentUserId)
      .order("created_at", { ascending: false });

    if (receivedError) console.error("Error fetching received requests:", receivedError);
    if (sentError) console.error("Error fetching sent requests:", sentError);

    setReceivedRequests(received || []);
    setSentRequests(sent || []);
    setIsLoading(false);
  };

  const updateRequestStatus = async (requestId: string, status: "accepted" | "declined") => {
    const { error } = await supabase
      .from("meeting_requests")
      .update({ status })
      .eq("id", requestId);

    if (error) {
      toast({
        title: "Failed to update request",
        variant: "destructive",
      });
    } else {
      toast({
        title: status === "accepted" ? "Meeting accepted!" : "Meeting declined",
      });
    }
  };

  const getParticipant = (id: string) => participants.find((p) => p.id === id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-accent/20 text-accent";
      case "declined":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-primary/20 text-primary";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Register to see your requests</h3>
          <p className="text-muted-foreground">
            You need to be registered for this event to view meeting requests
          </p>
        </CardContent>
      </Card>
    );
  }

  const allRequests = [...receivedRequests, ...sentRequests];
  const hasNoRequests = allRequests.length === 0;

  if (hasNoRequests) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No meeting requests yet</h3>
          <p className="text-muted-foreground">
            Send a meeting request to someone or wait for requests to appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  // Combine and categorize: accepted meetings first, then pending received, then pending sent
  const acceptedRequests = allRequests.filter(r => r.status === "accepted");
  const pendingReceived = receivedRequests.filter(r => r.status === "pending");
  const pendingSent = sentRequests.filter(r => r.status === "pending");
  const declinedRequests = allRequests.filter(r => r.status === "declined");

  return (
    <div className="space-y-6">
      {/* Accepted Meetings */}
      {acceptedRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-accent flex items-center gap-2">
            <Check className="w-4 h-4" />
            Accepted to Meet ({acceptedRequests.length})
          </h3>
          {acceptedRequests.map((request) => {
            const otherPersonId = request.requester_id === currentUserId ? request.target_id : request.requester_id;
            const otherPerson = getParticipant(otherPersonId);
            const isChatOpen = openChatId === request.id;

            if (!otherPerson) return null;

            return (
              <Card key={request.id} className="bg-accent/10 border-accent/30">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-base flex items-center gap-2">
                      {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-accent" />}
                      Meeting with {otherPerson.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isChatOpen ? "default" : "outline"}
                        className="h-7 px-2 text-xs"
                        onClick={() => setOpenChatId(isChatOpen ? null : request.id)}
                      >
                        <MessageCircle className="w-3 h-3 mr-1" />
                        Chat
                      </Button>
                      <Badge className="bg-accent/20 text-accent">
                        <Check className="w-3 h-3 mr-1" />
                        Accepted
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {request.message && (
                      <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                        "{request.message}"
                      </p>
                    )}
                    {otherPerson.how_to_find_me && (
                      <div className="flex items-start gap-2 bg-primary/10 p-3 rounded-lg">
                        <MapPin className="w-4 h-4 text-primary mt-0.5" />
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">How to find them:</p>
                          <p className="text-sm text-foreground">{otherPerson.how_to_find_me}</p>
                        </div>
                      </div>
                    )}
                    {isChatOpen && (
                      <MeetingChat
                        meetingRequestId={request.id}
                        currentUserId={currentUserId}
                        otherPersonName={otherPerson.name}
                        onClose={() => setOpenChatId(null)}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pending Received Requests */}
      {pendingReceived.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-primary flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Requests for You ({pendingReceived.length})
          </h3>
          {pendingReceived.map((request) => {
            const requester = getParticipant(request.requester_id);
            if (!requester) return null;

            return (
              <Card key={request.id} className="bg-card/50 border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-base flex items-center gap-2">
                      {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-accent" />}
                      {requester.name} wants to meet
                    </CardTitle>
                    <Badge className="bg-primary/20 text-primary">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {request.message && (
                      <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                        "{request.message}"
                      </p>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10"
                        onClick={() => updateRequestStatus(request.id, "declined")}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                        onClick={() => updateRequestStatus(request.id, "accepted")}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pending Sent Requests */}
      {pendingSent.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Send className="w-4 h-4" />
            Requests You Sent ({pendingSent.length})
          </h3>
          {pendingSent.map((request) => {
            const target = getParticipant(request.target_id);
            if (!target) return null;

            return (
              <Card key={request.id} className="bg-secondary/30 border-border">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground text-base flex items-center gap-2">
                      {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-accent" />}
                      Request to {target.name}
                    </CardTitle>
                    <Badge className="bg-muted text-muted-foreground">
                      <Clock className="w-3 h-3 mr-1" />
                      Waiting
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {request.message && (
                    <p className="text-sm text-muted-foreground bg-secondary/50 p-3 rounded-lg">
                      "{request.message}"
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Declined (collapsed/minimal) */}
      {declinedRequests.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-medium text-muted-foreground">
            Declined ({declinedRequests.length})
          </h3>
          {declinedRequests.map((request) => {
            const otherPersonId = request.requester_id === currentUserId ? request.target_id : request.requester_id;
            const otherPerson = getParticipant(otherPersonId);
            if (!otherPerson) return null;

            return (
              <div key={request.id} className="text-xs text-muted-foreground flex items-center gap-2 p-2 bg-secondary/20 rounded">
                <X className="w-3 h-3" />
                {otherPerson.name}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
