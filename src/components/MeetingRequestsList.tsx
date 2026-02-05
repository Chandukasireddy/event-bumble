import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, MessageSquare, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Participant {
  id: string;
  name: string;
  role: string;
  interests: string[];
  telegram_handle: string;
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
  const [requests, setRequests] = useState<MeetingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
      setRequests([]);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("meeting_requests")
      .select("*")
      .eq("event_id", eventId)
      .eq("target_id", currentUserId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching requests:", error);
    } else {
      setRequests(data || []);
    }
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

  if (requests.length === 0) {
    return (
      <Card className="bg-card/50 border-border">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No meeting requests for you yet</h3>
          <p className="text-muted-foreground">
            When someone wants to meet you, their request will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => {
        const requester = getParticipant(request.requester_id);
        const target = getParticipant(request.target_id);

        if (!requester || !target) return null;

        return (
          <Card key={request.id} className="bg-card/50 border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-foreground text-base flex items-center gap-2">
                  {request.is_ai_suggested && (
                    <Sparkles className="w-4 h-4 text-accent" />
                  )}
                  {requester.name} → {target.name}
                </CardTitle>
                <Badge className={getStatusColor(request.status)}>
                  {request.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                  {request.status === "accepted" && <Check className="w-3 h-3 mr-1" />}
                  {request.status === "declined" && <X className="w-3 h-3 mr-1" />}
                  {request.status}
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

                {request.suggested_time && (
                  <p className="text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Suggested time: {request.suggested_time}
                  </p>
                )}

                {request.status === "pending" && (
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
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
