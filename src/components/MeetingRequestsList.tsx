import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Check, X, Clock, MessageSquare, Sparkles, Send, MapPin, MessageCircle, ArrowRight } from "lucide-react";
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
  seen_by_target?: boolean;
}

interface MeetingRequestsListProps {
  eventId: string;
  participants: Participant[];
  currentUserId?: string;
  onMarkRequestSeen?: (requestId: string) => void;
  onMarkMessagesRead?: (meetingRequestId: string) => void;
}

export function MeetingRequestsList({ 
  eventId, 
  participants, 
  currentUserId,
  onMarkRequestSeen,
  onMarkMessagesRead,
}: MeetingRequestsListProps) {
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

  // Mark pending requests as seen when component loads
  useEffect(() => {
    if (onMarkRequestSeen && receivedRequests.length > 0) {
      receivedRequests
        .filter(r => r.status === "pending" && !r.seen_by_target)
        .forEach(r => onMarkRequestSeen(r.id));
    }
  }, [receivedRequests, onMarkRequestSeen]);

  const handleOpenChat = (requestId: string) => {
    if (openChatId === requestId) {
      setOpenChatId(null);
    } else {
      setOpenChatId(requestId);
      if (onMarkMessagesRead) {
        onMarkMessagesRead(requestId);
      }
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-serif text-lg font-medium text-foreground mb-2">Register to see your requests</h3>
        <p className="text-muted-foreground">
          You need to be registered for this event to view meeting requests
        </p>
      </div>
    );
  }

  const allRequests = [...receivedRequests, ...sentRequests];
  const hasNoRequests = allRequests.length === 0;

  if (hasNoRequests) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-serif text-lg font-medium text-foreground mb-2">No meeting requests yet</h3>
        <p className="text-muted-foreground">
          Send a meeting request to someone or wait for requests to appear here
        </p>
      </div>
    );
  }

  // Combine and categorize: accepted meetings first, then pending received, then pending sent
  const acceptedRequests = allRequests.filter(r => r.status === "accepted");
  const pendingReceived = receivedRequests.filter(r => r.status === "pending");
  const pendingSent = sentRequests.filter(r => r.status === "pending");
  const declinedRequests = allRequests.filter(r => r.status === "declined");

  return (
    <div className="space-y-8">
      {/* Accepted Meetings */}
      {acceptedRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-success flex items-center gap-2">
            <Check className="w-4 h-4" />
            Accepted to Meet ({acceptedRequests.length})
          </h3>
          {acceptedRequests.map((request, index) => {
            const otherPersonId = request.requester_id === currentUserId ? request.target_id : request.requester_id;
            const otherPerson = getParticipant(otherPersonId);
            const isChatOpen = openChatId === request.id;

            if (!otherPerson) return null;

            return (
              <div 
                key={request.id} 
                className={`py-6 border-b border-border/30 last:border-b-0 ${
                  index % 2 === 1 ? 'md:pl-4' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-primary" />}
                    <span className="font-serif text-lg font-medium text-foreground">
                      Meeting with {otherPerson.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleOpenChat(request.id)}
                      className={`text-sm flex items-center gap-1 transition-colors ${
                        isChatOpen ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" />
                      Chat
                    </button>
                    <span className="text-xs text-success flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Accepted
                    </span>
                  </div>
                </div>
                
                {request.message && (
                  <p className="text-sm text-muted-foreground font-serif italic mb-3">
                    "{request.message}"
                  </p>
                )}
                
                {otherPerson.how_to_find_me && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                    <div>
                      <span className="text-xs text-muted-foreground">How to find them: </span>
                      <span className="text-foreground">{otherPerson.how_to_find_me}</span>
                    </div>
                  </div>
                )}
                
                {isChatOpen && (
                  <div className="mt-4">
                    <MeetingChat
                      meetingRequestId={request.id}
                      currentUserId={currentUserId}
                      otherPersonName={otherPerson.name}
                      onClose={() => setOpenChatId(null)}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pending Received Requests */}
      {pendingReceived.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-primary flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Requests for You ({pendingReceived.length})
          </h3>
          {pendingReceived.map((request, index) => {
            const requester = getParticipant(request.requester_id);
            if (!requester) return null;

            return (
              <div 
                key={request.id} 
                className={`py-6 border-b border-border/30 last:border-b-0 ${
                  index % 2 === 1 ? 'md:pl-4' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-primary" />}
                    <span className="font-serif text-lg font-medium text-foreground">
                      {requester.name} wants to meet
                    </span>
                  </div>
                  <span className="text-xs text-primary flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pending
                  </span>
                </div>
                
                {request.message && (
                  <p className="text-sm text-muted-foreground font-serif italic mb-4">
                    "{request.message}"
                  </p>
                )}
                
                {/* Text link actions */}
                <div className="flex gap-6">
                  <button
                    onClick={() => updateRequestStatus(request.id, "declined")}
                    className="text-sm text-muted-foreground hover:text-destructive transition-colors"
                  >
                    Decline
                  </button>
                  <button
                    onClick={() => updateRequestStatus(request.id, "accepted")}
                    className="text-sm text-success hover:underline flex items-center gap-1"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pending Sent Requests */}
      {pendingSent.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Send className="w-4 h-4" />
            Requests You Sent ({pendingSent.length})
          </h3>
          {pendingSent.map((request, index) => {
            const target = getParticipant(request.target_id);
            if (!target) return null;

            return (
              <div 
                key={request.id} 
                className={`py-4 border-b border-border/20 last:border-b-0 ${
                  index % 2 === 1 ? 'md:pl-4' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-primary" />}
                    <span className="text-foreground">
                      Request to {target.name}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Waiting
                  </span>
                </div>
                {request.message && (
                  <p className="text-sm text-muted-foreground font-serif italic mt-2">
                    "{request.message}"
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Declined (collapsed/minimal) */}
      {declinedRequests.length > 0 && (
        <div className="space-y-2 pt-4 border-t border-border/20">
          <h3 className="text-xs font-medium text-muted-foreground">
            Declined ({declinedRequests.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {declinedRequests.map((request) => {
              const otherPersonId = request.requester_id === currentUserId ? request.target_id : request.requester_id;
              const otherPerson = getParticipant(otherPersonId);
              if (!otherPerson) return null;

              return (
                <span key={request.id} className="text-xs text-muted-foreground">
                  {otherPerson.name}
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
