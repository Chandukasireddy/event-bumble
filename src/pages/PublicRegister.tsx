import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Code, Palette, Briefcase, X, Send, Calendar, MapPin, CheckCircle2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const INTEREST_SUGGESTIONS = [
  "AI/ML", "Web3", "Mobile", "Backend", "Frontend", "DevOps",
  "UI/UX", "Data Science", "Blockchain", "IoT", "AR/VR", "Gaming"
];

const ROLE_ICONS = {
  Dev: Code,
  Designer: Palette,
  Business: Briefcase,
};

interface Event {
  id: string;
  name: string;
  description: string | null;
  event_date: string | null;
  location: string | null;
}

interface ExistingRegistration {
  id: string;
  name: string;
  role: string;
  interests: string[];
  telegram_handle: string;
}

export default function PublicRegister() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registrationId, setRegistrationId] = useState<string | null>(null);
  
  // Existing registrations for autocomplete
  const [existingRegistrations, setExistingRegistrations] = useState<ExistingRegistration[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<ExistingRegistration[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedExisting, setSelectedExisting] = useState<ExistingRegistration | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);
  const [telegramHandle, setTelegramHandle] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (shareCode) {
      fetchEvent();
    }
  }, [shareCode]);

  // Close suggestions on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchEvent = async () => {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("share_code", shareCode)
      .maybeSingle();

    if (error || !data) {
      console.error("Error fetching event:", error);
      setIsLoading(false);
      return;
    }
    
    setEvent(data);
    
    // Fetch existing registrations for this event (for autocomplete)
    const { data: registrations } = await supabase
      .from("registrations")
      .select("id, name, role, interests, telegram_handle")
      .eq("event_id", data.id);
    
    if (registrations) {
      setExistingRegistrations(registrations);
    }
    
    setIsLoading(false);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSelectedExisting(null);
    
    // Show suggestions after 3 characters
    if (value.length >= 3) {
      const matches = existingRegistrations.filter(
        (reg) => reg.name.toLowerCase().includes(value.toLowerCase())
      );
      setNameSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setNameSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const selectExistingRegistration = (reg: ExistingRegistration) => {
    setSelectedExisting(reg);
    setName(reg.name);
    setRole(reg.role);
    setInterests(reg.interests);
    setTelegramHandle(reg.telegram_handle === "@placeholder" ? "" : reg.telegram_handle);
    setShowSuggestions(false);
    
    toast({
      title: "Profile found!",
      description: "Complete your details to update your registration",
    });
  };

  const addInterest = (interest: string) => {
    if (interest && !interests.includes(interest) && interests.length < 5) {
      setInterests([...interests, interest]);
      setCustomInterest("");
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter((i) => i !== interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) return;

    if (!name || !role || interests.length === 0 || !telegramHandle) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      let resultId: string;
      
      if (selectedExisting) {
        // Update existing registration
        const { error } = await supabase
          .from("registrations")
          .update({
            role,
            interests,
            telegram_handle: telegramHandle,
          })
          .eq("id", selectedExisting.id);

        if (error) throw error;
        resultId = selectedExisting.id;
      } else {
        // Create new registration
        const { data, error } = await supabase
          .from("registrations")
          .insert({
            name,
            role,
            interests,
            telegram_handle: telegramHandle,
            event_id: event.id,
          })
          .select()
          .single();

        if (error) throw error;
        resultId = data.id;
      }

      setRegistrationId(resultId);
      toast({
        title: selectedExisting ? "Profile updated!" : "Registration successful!",
        description: "Redirecting to event dashboard...",
      });
      
      // Redirect to event dashboard
      navigate(`/event/${event.id}`);
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const RoleIcon = role ? ROLE_ICONS[role as keyof typeof ROLE_ICONS] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Zap className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Event not found</h2>
        <p className="text-muted-foreground">This registration link may be invalid or expired</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md bg-card/50 border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4 glow-green">
                <CheckCircle2 className="w-8 h-8 text-accent" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">You're In!</h2>
              <p className="text-muted-foreground text-center mb-6">
                Your profile is now visible to other participants at {event.name}
              </p>
              <Button asChild className="bg-primary hover:bg-primary/90">
                <Link to={`/profile/${registrationId}`}>
                  View & Edit Profile
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-purple">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-foreground">{event.name}</h1>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
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
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-bold text-gradient">
                Join the Network
              </h2>
              <p className="text-muted-foreground">
                {event.description || "Register to connect with other participants"}
              </p>
            </div>

            <Card className="bg-card/50 border-border">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name with Autocomplete */}
                  <div className="space-y-2 relative" ref={suggestionsRef}>
                    <Label htmlFor="name" className="text-foreground/80">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Start typing your name..."
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      onFocus={() => name.length >= 3 && nameSuggestions.length > 0 && setShowSuggestions(true)}
                      className="bg-secondary border-border focus:border-primary"
                      autoComplete="off"
                    />
                    {selectedExisting && (
                      <p className="text-xs text-accent flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Found your registration! Update your details below.
                      </p>
                    )}
                    
                    {/* Autocomplete dropdown */}
                    {showSuggestions && nameSuggestions.length > 0 && (
                      <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {nameSuggestions.map((reg) => (
                          <button
                            key={reg.id}
                            type="button"
                            className="w-full px-4 py-3 text-left hover:bg-secondary/50 flex items-center gap-3 transition-colors"
                            onClick={() => selectExistingRegistration(reg)}
                          >
                            <User className="w-4 h-4 text-primary flex-shrink-0" />
                            <div>
                              <p className="font-medium text-foreground">{reg.name}</p>
                              <p className="text-xs text-muted-foreground">
                                Click to complete your registration
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-foreground/80">Role *</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger className="bg-secondary border-border focus:border-primary">
                        <SelectValue placeholder="Select your role">
                          {role && RoleIcon && (
                            <span className="flex items-center gap-2">
                              <RoleIcon className="h-4 w-4 text-primary" />
                              {role}
                            </span>
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {Object.entries(ROLE_ICONS).map(([roleName, Icon]) => (
                          <SelectItem key={roleName} value={roleName}>
                            <span className="flex items-center gap-2">
                              <Icon className="h-4 w-4 text-primary" />
                              {roleName}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground/80">Interests (select up to 5) *</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {interests.map((interest) => (
                        <Badge
                          key={interest}
                          variant="secondary"
                          className="bg-primary/20 text-primary border border-primary/30 cursor-pointer hover:bg-primary/30"
                          onClick={() => removeInterest(interest)}
                        >
                          {interest}
                          <X className="h-3 w-3 ml-1" />
                        </Badge>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {INTEREST_SUGGESTIONS.filter((i) => !interests.includes(i)).map((interest) => (
                        <Badge
                          key={interest}
                          variant="outline"
                          className="cursor-pointer border-muted-foreground/30 hover:border-accent hover:text-accent"
                          onClick={() => addInterest(interest)}
                        >
                          {interest}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Input
                        placeholder="Add custom interest"
                        value={customInterest}
                        onChange={(e) => setCustomInterest(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addInterest(customInterest);
                          }
                        }}
                        className="bg-secondary border-border"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addInterest(customInterest)}
                        disabled={!customInterest || interests.length >= 5}
                        className="border-muted-foreground/30"
                      >
                        Add
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-foreground/80">LinkedIn Profile URL *</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={telegramHandle}
                      onChange={(e) => setTelegramHandle(e.target.value)}
                      className="bg-secondary border-border focus:border-primary"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 glow-purple"
                  >
                    {isSubmitting ? (
                      "Saving..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        {selectedExisting ? "Update Registration" : "Register"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
