import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Code, Palette, Briefcase, MessageSquare, ExternalLink, Check, Clock } from "lucide-react";
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
}

export function ParticipantCard({
  participant,
  eventId,
  onSelect,
  isSelected,
  currentUserId,
  compact = false,
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
    
    // Subscribe to changes
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

  if (compact) {
    const isMe = currentUserId === participant.id;
    
    return (
      <Card className="bg-card border-border hover:border-primary/50 transition-colors">
        <CardHeader className="pb-2 pt-3 px-3">
          <div className="flex items-center gap-2">
            <RoleIcon className="w-4 h-4 text-primary flex-shrink-0" />
            <CardTitle className="text-foreground text-sm font-medium truncate">
              {participant.name}
              {isMe && <span className="text-xs text-muted-foreground ml-1">(You)</span>}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0 space-y-2">
          <Badge className="bg-primary/10 text-primary border border-primary/20 text-xs">
            {participant.role}
          </Badge>
          <div className="flex flex-wrap gap-1">
            {participant.interests.slice(0, 3).map((interest, index) => (
              <Badge
                key={`${interest}-${index}`}
                variant="outline"
                className="text-[10px] px-1.5 py-0 border-primary/30 text-primary"
              >
                {interest}
              </Badge>
            ))}
            {participant.interests.length > 3 && (
              <span className="text-[10px] text-muted-foreground">+{participant.interests.length - 3}</span>
            )}
          </div>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 h-7 text-xs border-border hover:border-primary"
              onClick={() => window.open(participant.telegram_handle, "_blank")}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              LinkedIn
            </Button>
            {!isMe && (
              requestStatus === "accepted" ? (
                <Badge className="h-7 px-2 bg-success/10 text-success border border-success/20 text-xs flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  Matched
                </Badge>
              ) : requestStatus === "pending" ? (
                <Badge className="h-7 px-2 bg-primary/10 text-primary border border-primary/20 text-xs flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Pending
                </Badge>
              ) : (
                <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                  <DialogTrigger asChild>
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Meet
                    </Button>
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
                        <Button
                          onClick={handleRequestMeeting}
                          disabled={isSubmitting}
                          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {isSubmitting ? "Sending..." : "Send Request"}
                        </Button>
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
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`bg-card border-border transition-all hover:border-primary/50 ${
        isSelected ? "border-primary" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg font-sans font-semibold">
            <RoleIcon className="w-5 h-5 text-primary" />
            {participant.name}
          </CardTitle>
          <Badge className="bg-primary/10 text-primary border border-primary/20">
            {participant.role}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-1.5">
          {participant.interests.map((interest) => (
            <Badge
              key={interest}
              variant="outline"
              className="text-xs border-primary/30 text-primary"
            >
              {interest}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={currentUserId === participant.id ? "flex-1" : "flex-1 border-border hover:border-primary"}
            onClick={(e) => {
              e.stopPropagation();
              window.open(participant.telegram_handle, "_blank");
            }}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            LinkedIn
          </Button>

          {currentUserId && currentUserId !== participant.id && (
            requestStatus === "accepted" ? (
              <Badge className="h-8 px-3 bg-success/10 text-success border border-success/20 flex items-center">
                <Check className="w-4 h-4 mr-1" />
                Matched
              </Badge>
            ) : requestStatus === "pending" ? (
              <Badge className="h-8 px-3 bg-primary/10 text-primary border border-primary/20 flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Pending
              </Badge>
            ) : (
              <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Request Meet
                  </Button>
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
                  <Button
                    onClick={handleRequestMeeting}
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSubmitting ? "Sending..." : "Send Request"}
                  </Button>
                </div>
              </DialogContent>
              </Dialog>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
