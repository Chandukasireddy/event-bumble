import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  CalendarIcon,
  Clock,
  MapPin,
  Coffee,
  Building,
  Users,
  Send,
  Check,
  RefreshCw,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  meeting_date: string | null;
  meeting_time: string | null;
  meeting_location: string | null;
  reschedule_message: string | null;
}

interface MeetingBookingCardProps {
  request: MeetingRequest;
  otherPerson: Participant;
  currentUserId: string;
  onUpdate: () => void;
}

const LOCATION_OPTIONS = [
  { id: "coffee_spot", label: "Coffee Spot", icon: Coffee },
  { id: "lobby", label: "Lobby", icon: Building },
  { id: "main_floor", label: "Main Floor", icon: Users },
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30",
];

export function MeetingBookingCard({
  request,
  otherPerson,
  currentUserId,
  onUpdate,
}: MeetingBookingCardProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    request.meeting_date ? new Date(request.meeting_date) : undefined
  );
  const [selectedTime, setSelectedTime] = useState(request.meeting_time || "");
  const [selectedLocation, setSelectedLocation] = useState(request.meeting_location || "");
  const [directMessage, setDirectMessage] = useState("");
  const [rescheduleMessage, setRescheduleMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const isRequester = request.requester_id === currentUserId;
  const canSchedule = request.status === "accepted" && isRequester;
  const canRespondToSchedule = request.status === "scheduled" && !isRequester;
  const isRescheduleRequested = request.status === "reschedule_requested";
  const isConfirmed = request.status === "confirmed";

  const handleScheduleMeeting = async () => {
    if (!selectedDate || !selectedTime || !selectedLocation) {
      toast({
        title: "Please fill all fields",
        description: "Select a date, time, and location for the meeting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from("meeting_requests")
      .update({
        meeting_date: format(selectedDate, "yyyy-MM-dd"),
        meeting_time: selectedTime,
        meeting_location: selectedLocation,
        message: directMessage || request.message,
        status: "scheduled",
      })
      .eq("id", request.id);

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Failed to schedule meeting", variant: "destructive" });
    } else {
      toast({ title: "Meeting scheduled!", description: "Waiting for confirmation" });
      onUpdate();
    }
  };

  const handleAcceptSchedule = async () => {
    setIsSubmitting(true);
    const { error } = await supabase
      .from("meeting_requests")
      .update({ status: "confirmed" })
      .eq("id", request.id);

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Failed to confirm meeting", variant: "destructive" });
    } else {
      toast({ title: "Meeting confirmed!", description: "See you there!" });
      onUpdate();
    }
  };

  const handleRequestReschedule = async () => {
    if (!rescheduleMessage.trim()) {
      toast({
        title: "Please add a message",
        description: "Let them know why you need to reschedule",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from("meeting_requests")
      .update({
        status: "reschedule_requested",
        reschedule_message: rescheduleMessage,
      })
      .eq("id", request.id);

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Failed to request reschedule", variant: "destructive" });
    } else {
      toast({ title: "Reschedule requested", description: "Waiting for new time" });
      setRescheduleMessage("");
      onUpdate();
    }
  };

  const handleRespondToReschedule = async () => {
    if (!selectedDate || !selectedTime || !selectedLocation) {
      toast({
        title: "Please fill all fields",
        description: "Select a new date, time, and location",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await supabase
      .from("meeting_requests")
      .update({
        meeting_date: format(selectedDate, "yyyy-MM-dd"),
        meeting_time: selectedTime,
        meeting_location: selectedLocation,
        message: directMessage || request.message,
        status: "scheduled",
        reschedule_message: null,
      })
      .eq("id", request.id);

    setIsSubmitting(false);

    if (error) {
      toast({ title: "Failed to reschedule meeting", variant: "destructive" });
    } else {
      toast({ title: "Meeting rescheduled!", description: "Waiting for confirmation" });
      onUpdate();
    }
  };

  // Confirmed meeting display
  if (isConfirmed) {
    return (
      <Card className="bg-accent/10 border-accent/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-accent" />}
              Meeting with {otherPerson.name}
            </CardTitle>
            <Badge className="bg-accent text-accent-foreground">
              <Check className="w-3 h-3 mr-1" />
              Confirmed
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {request.meeting_date && format(new Date(request.meeting_date), "MMM d")}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">{request.meeting_time}</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm capitalize">
                {request.meeting_location?.replace("_", " ")}
              </span>
            </div>
          </div>
          {otherPerson.how_to_find_me && (
            <div className="flex items-start gap-2 bg-primary/10 p-3 rounded-lg">
              <MapPin className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-muted-foreground mb-1">How to find them:</p>
                <p className="text-sm text-foreground">{otherPerson.how_to_find_me}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Reschedule requested - show to requester to propose new time
  if (isRescheduleRequested && isRequester) {
    return (
      <Card className="bg-orange-500/10 border-orange-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-accent" />}
              Meeting with {otherPerson.name}
            </CardTitle>
            <Badge className="bg-orange-500/20 text-orange-500">
              <RefreshCw className="w-3 h-3 mr-1" />
              Reschedule Requested
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {request.reschedule_message && (
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Their message:</p>
              <p className="text-sm text-foreground">"{request.reschedule_message}"</p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Propose a new time:</p>

            {/* Date Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* Time Slots */}
            <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs",
                    selectedTime === time && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>

            {/* Location Options */}
            <div className="grid grid-cols-3 gap-2">
              {LOCATION_OPTIONS.map((loc) => {
                const Icon = loc.icon;
                return (
                  <Button
                    key={loc.id}
                    variant={selectedLocation === loc.id ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex flex-col h-auto py-2",
                      selectedLocation === loc.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setSelectedLocation(loc.id)}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span className="text-xs">{loc.label}</span>
                  </Button>
                );
              })}
            </div>

            {/* Direct Message */}
            <Textarea
              placeholder="Add a message (optional)..."
              value={directMessage}
              onChange={(e) => setDirectMessage(e.target.value)}
              className="min-h-[60px] bg-secondary/50"
            />

            <Button
              onClick={handleRespondToReschedule}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Send className="w-4 h-4 mr-2" />
              Send New Time
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Waiting for reschedule response (target perspective)
  if (isRescheduleRequested && !isRequester) {
    return (
      <Card className="bg-orange-500/10 border-orange-500/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              Meeting with {otherPerson.name}
            </CardTitle>
            <Badge className="bg-orange-500/20 text-orange-500">
              <RefreshCw className="w-3 h-3 mr-1" />
              Awaiting New Time
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You requested to reschedule. Waiting for {otherPerson.name} to propose a new time.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Scheduled - waiting for target to accept or reschedule
  if (request.status === "scheduled" && !isRequester) {
    return (
      <Card className="bg-primary/10 border-primary/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-accent" />}
              {otherPerson.name} scheduled a meeting
            </CardTitle>
            <Badge className="bg-primary/20 text-primary">
              <Clock className="w-3 h-3 mr-1" />
              Pending Response
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {request.meeting_date && format(new Date(request.meeting_date), "MMM d")}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">{request.meeting_time}</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm capitalize">
                {request.meeting_location?.replace("_", " ")}
              </span>
            </div>
          </div>

          {request.message && (
            <div className="bg-secondary/50 p-3 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Message:</p>
              <p className="text-sm text-foreground">"{request.message}"</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleAcceptSchedule}
              disabled={isSubmitting}
              className="flex-1 bg-accent hover:bg-accent/90"
            >
              <Check className="w-4 h-4 mr-2" />
              Accept
            </Button>
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Need a different time?</p>
            <Textarea
              placeholder="Let them know why you need to reschedule..."
              value={rescheduleMessage}
              onChange={(e) => setRescheduleMessage(e.target.value)}
              className="min-h-[60px] bg-secondary/50"
            />
            <Button
              variant="outline"
              onClick={handleRequestReschedule}
              disabled={isSubmitting}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Request Reschedule
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Scheduled - requester waiting for response
  if (request.status === "scheduled" && isRequester) {
    return (
      <Card className="bg-secondary/30 border-border">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-accent" />}
              Meeting with {otherPerson.name}
            </CardTitle>
            <Badge className="bg-muted text-muted-foreground">
              <Clock className="w-3 h-3 mr-1" />
              Awaiting Response
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <CalendarIcon className="w-4 h-4 text-primary" />
              <span className="text-sm">
                {request.meeting_date && format(new Date(request.meeting_date), "MMM d")}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm">{request.meeting_time}</span>
            </div>
            <div className="flex items-center gap-2 bg-secondary/50 p-2 rounded-lg">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm capitalize">
                {request.meeting_location?.replace("_", " ")}
              </span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Waiting for {otherPerson.name} to confirm
          </p>
        </CardContent>
      </Card>
    );
  }

  // Accepted - show booking form to requester
  if (canSchedule) {
    return (
      <Card className="bg-accent/10 border-accent/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-accent" />}
              Book meeting with {otherPerson.name}
            </CardTitle>
            <Badge className="bg-accent/20 text-accent">
              <Check className="w-3 h-3 mr-1" />
              Accepted
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {otherPerson.name} accepted! Schedule your meeting:
          </p>

          {/* Date Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date()}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Time Slots */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Select time:</p>
            <div className="grid grid-cols-4 gap-1 max-h-32 overflow-y-auto">
              {TIME_SLOTS.map((time) => (
                <Button
                  key={time}
                  variant={selectedTime === time ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "text-xs",
                    selectedTime === time && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => setSelectedTime(time)}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          {/* Location Options */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Select location:</p>
            <div className="grid grid-cols-3 gap-2">
              {LOCATION_OPTIONS.map((loc) => {
                const Icon = loc.icon;
                return (
                  <Button
                    key={loc.id}
                    variant={selectedLocation === loc.id ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "flex flex-col h-auto py-3",
                      selectedLocation === loc.id && "bg-primary text-primary-foreground"
                    )}
                    onClick={() => setSelectedLocation(loc.id)}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs">{loc.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Direct Message */}
          <div>
            <p className="text-xs text-muted-foreground mb-2">Add a message (optional):</p>
            <Textarea
              placeholder="Looking forward to meeting you!"
              value={directMessage}
              onChange={(e) => setDirectMessage(e.target.value)}
              className="min-h-[60px] bg-secondary/50"
            />
          </div>

          <Button
            onClick={handleScheduleMeeting}
            disabled={isSubmitting || !selectedDate || !selectedTime || !selectedLocation}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <Send className="w-4 h-4 mr-2" />
            Send Meeting Request
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Accepted - waiting for requester to schedule (target perspective)
  if (request.status === "accepted" && !isRequester) {
    return (
      <Card className="bg-accent/10 border-accent/30">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-foreground text-base flex items-center gap-2">
              {request.is_ai_suggested && <Sparkles className="w-4 h-4 text-accent" />}
              Meeting with {otherPerson.name}
            </CardTitle>
            <Badge className="bg-accent/20 text-accent">
              <Check className="w-3 h-3 mr-1" />
              Accepted
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You accepted! Waiting for {otherPerson.name} to schedule the meeting time.
          </p>
        </CardContent>
      </Card>
    );
  }

  return null;
}
