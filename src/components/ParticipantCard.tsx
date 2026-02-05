import { useState } from "react";
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
import { Code, Palette, Briefcase, MessageSquare, ExternalLink } from "lucide-react";
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
}

export function ParticipantCard({
  participant,
  eventId,
  onSelect,
  isSelected,
  currentUserId,
}: ParticipantCardProps) {
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

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

  return (
    <Card
      className={`bg-card/50 border-border cursor-pointer transition-all hover:border-primary/50 ${
        isSelected ? "border-primary glow-purple" : ""
      }`}
      onClick={onSelect}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-foreground flex items-center gap-2 text-lg">
            <RoleIcon className="w-5 h-5 text-primary" />
            {participant.name}
          </CardTitle>
          <Badge variant="secondary" className="bg-primary/20 text-primary">
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
              className="text-xs border-muted-foreground/30"
            >
              {interest}
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-muted-foreground/30"
            onClick={(e) => {
              e.stopPropagation();
              window.open(
                `https://t.me/${participant.telegram_handle.replace("@", "")}`,
                "_blank"
              );
            }}
          >
            <ExternalLink className="w-4 h-4 mr-1" />
            Telegram
          </Button>

          <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={(e) => e.stopPropagation()}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                Request Meet
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border" onClick={(e) => e.stopPropagation()}>
              <DialogHeader>
                <DialogTitle>Request Meeting with {participant.name}</DialogTitle>
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
                    className="bg-secondary border-border"
                  />
                </div>
                <Button
                  onClick={handleRequestMeeting}
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? "Sending..." : "Send Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
