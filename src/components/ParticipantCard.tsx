import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Code, Palette, Briefcase, ExternalLink, Check, Clock, ArrowRight } from "lucide-react";
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
  created_at: string;
}

interface ParticipantCardProps {
  participant: Participant;
  eventId: string;
  onSelect?: () => void;
  isSelected?: boolean;
  currentUserId?: string;
  compact?: boolean;
  isOrganizer?: boolean;
}

export function ParticipantCard({
  participant,
  eventId,
  onSelect,
  isSelected,
  currentUserId,
  compact = false,
  isOrganizer = false,
}: ParticipantCardProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestStatus, setRequestStatus] = useState<"none" | "pending" | "accepted">("none");
  const { toast } = useToast();

  // Check existing request status
  useEffect(() => {
    const checkExistingRequest = async () => {
      if (!currentUserId || currentUserId === participant.id) return;
      
      const { data } = await supabase
        .from("meeting_requests")
        .select("status")
        .eq("event_id", eventId)
        .or(`and(requester_id.eq.${currentUserId},target_id.eq.${participant.id}),and(requester_id.eq.${participant.id},target_id.eq.${currentUserId})`)
        .in("status", ["pending", "accepted"])
        .maybeSingle();
      
      if (data) {
        setRequestStatus(data.status as "pending" | "accepted");
      } else {
        setRequestStatus("none");
      }
    };
    
    checkExistingRequest();
    
    const channel = supabase
      .channel(`request-status-${participant.id}-${currentUserId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "meeting_requests", filter: `event_id=eq.${eventId}` },
        () => checkExistingRequest()
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, participant.id, eventId]);

  const RoleIcon = ROLE_ICONS[participant.role as keyof typeof ROLE_ICONS] || Code;

  const handleRequestMeeting = async () => {
    if (!currentUserId) {
      toast({
        title: "Select yourself first",
        description: "Click on your profile to select it before requesting meetings",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("meeting_requests").insert({
        event_id: eventId,
        requester_id: currentUserId,
        target_id: participant.id,
        message: message || null,
      });

      if (error) throw error;

      toast({
        title: "Meeting request sent!",
        description: `Your request has been sent to ${participant.name}`,
      });
      setShowRequestDialog(false);
      setMessage("");
    } catch (error) {
      console.error("Error sending request:", error);
      toast({
        title: "Failed to send request",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMe = currentUserId === participant.id;

  if (compact) {
    return (
      <div className="py-4 border-b border-border/30 last:border-b-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <RoleIcon className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="font-medium text-foreground text-sm">
                {participant.name}
                {isMe && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
              </span>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary">
                {participant.role}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {participant.interests.slice(0, 3).map((interest, index) => (
                <span
                  key={`${interest}-${index}`}
                  className="text-[10px] text-muted-foreground"
                >
                  {interest}{index < Math.min(2, participant.interests.length - 1) && " · "}
                </span>
              ))}
              {participant.interests.length > 3 && (
                <span className="text-[10px] text-muted-foreground">+{participant.interests.length - 3}</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.open(participant.telegram_handle, "_blank")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
            {!isOrganizer && !isMe && (
              requestStatus === "accepted" ? (
                <span className="text-xs text-success flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Matched
                </span>
              ) : requestStatus === "pending" ? (
                <span className="text-xs text-primary flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Pending
                </span>
              ) : (
                <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                  <DialogTrigger asChild>
                    <button className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      Meet
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-card border-border">
                    <DialogHeader>
                      <DialogTitle className="font-serif">Request Meeting with {participant.name}</DialogTitle>
                      <DialogDescription>
                        {currentUserId 
                          ? "Send a meeting request to connect during the networking session"
                          : "You need to register for this event first to send meeting requests"
                        }
                      </DialogDescription>
                    </DialogHeader>
                    {currentUserId ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="message-compact">Message (optional)</Label>
                          <Textarea
                            id="message-compact"
                            placeholder="Hi! I'd love to chat about..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="bg-input border-border focus:border-primary"
                          />
                        </div>
                        {/* Text link CTA */}
                        <button
                          onClick={handleRequestMeeting}
                          disabled={isSubmitting}
                          className="w-full text-link-cta justify-center py-4 border-t border-border/50"
                        >
                          {isSubmitting ? "Sending..." : "Send Request →"}
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Please register for this event first using the registration link.
                      </p>
                    )}
                  </DialogContent>
                </Dialog>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`py-4 border-b border-border/30 last:border-b-0 cursor-pointer transition-colors hover:bg-secondary/30 ${
        isSelected ? "bg-primary/5" : ""
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <RoleIcon className="w-5 h-5 text-primary" />
            <span className="font-serif text-lg font-medium text-foreground">{participant.name}</span>
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              {participant.role}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {participant.interests.map((interest) => (
              <span
                key={interest}
                className="text-xs text-muted-foreground"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              window.open(participant.telegram_handle, "_blank");
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {!isOrganizer && currentUserId && currentUserId !== participant.id && (
            requestStatus === "accepted" ? (
              <span className="text-xs text-success flex items-center gap-1">
                <Check className="w-4 h-4" />
                Matched
              </span>
            ) : requestStatus === "pending" ? (
              <span className="text-xs text-primary flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Pending
              </span>
            ) : (
              <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogTrigger asChild>
                  <button
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Meet
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border" onClick={(e) => e.stopPropagation()}>
                  <DialogHeader>
                    <DialogTitle className="font-serif">Request Meeting with {participant.name}</DialogTitle>
                    <DialogDescription>
                      Send a meeting request to connect during the networking session
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="message">Message (optional)</Label>
                      <Textarea
                        id="message"
                        placeholder="Hi! I'd love to chat about..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-input border-border focus:border-primary"
                      />
                    </div>
                    {/* Text link CTA */}
                    <button
                      onClick={handleRequestMeeting}
                      disabled={isSubmitting}
                      className="w-full text-link-cta justify-center py-4 border-t border-border/50"
                    >
                      {isSubmitting ? "Sending..." : "Send Request →"}
                    </button>
                  </div>
                </DialogContent>
              </Dialog>
            )
          )}
        </div>
      </div>
    </div>
  );
}
