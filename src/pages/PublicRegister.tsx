import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, CheckCircle2, User, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SparkleIcon } from "@/components/icons/GeometricIcons";
import { NetworkBackground } from "@/components/NetworkBackground";
import { CornerBracket, CornerBracketFlipped } from "@/components/icons/DecorativeLines";

const VIBE_OPTIONS = [
  { value: "productivity", label: "⚡ Productivity & Automation" },
  { value: "creative", label: "🎨 Creative Arts (Media/Music)" },
  { value: "health", label: "🏥 Health & Wellness" },
  { value: "social", label: "🌍 Social Impact" },
  { value: "knowledge", label: "🧠 Knowledge & \"Second Brains\"" },
  { value: "fintech", label: "💰 FinTech & Money" },
  { value: "education", label: "💼 Education & Jobs" },
  { value: "shopping", label: "🛒 Shopping & Retail" },
  { value: "infrastructure", label: "🛠️ Infrastructure (The \"Pipes\")" },
  { value: "gaming", label: "🎮 Gaming & Entertainment" },
];

const SUPERPOWER_OPTIONS = [
  { value: "builds", label: "💻 Builds", desc: "I handle the code and technical logic." },
  { value: "shapes", label: "🎨 Shapes", desc: "I handle the design, UX, and \"feel.\"" },
  { value: "plans", label: "📈 Plans", desc: "I handle the strategy and market fit." },
  { value: "speaks", label: "🗣️ Speaks", desc: "I handle the story and the pitch." },
];

const COPILOT_OPTIONS = [
  { value: "technical", label: "🛠️ Technical Engine", desc: "Someone to build the \"guts\" and solve the logic." },
  { value: "creative", label: "🌈 Creative Spark", desc: "Someone to make it beautiful and human-centric." },
  { value: "strategic", label: "🗺️ Strategic Guide", desc: "Someone to find the problem and the \"why.\"" },
  { value: "doer", label: "🚀 High-Speed Doer", desc: "Someone to ship fast and keep the energy high." },
  { value: "thinker", label: "🧐 Deep Thinker", desc: "Someone to challenge the ideas and ensure quality." },
];

const OFFSCREEN_OPTIONS = [
  { value: "outdoor", label: "🏔️ In the wild", desc: "Hiking/Cycling/Climbing" },
  { value: "city", label: "🖼️ In the city", desc: "Galleries/Music/Food" },
  { value: "home", label: "🍳 In the kitchen", desc: "Cooking/Hosting" },
  { value: "gaming", label: "🕹️ In the game", desc: "Sports/Gaming/Chess" },
];

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
}

interface SelectButtonProps {
  selected: boolean;
  onClick: () => void;
  label: string;
  desc?: string;
}

function SelectButton({ selected, onClick, label, desc }: SelectButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded border transition-all duration-200",
        selected
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-transparent hover:border-primary/50"
      )}
    >
      <span className="font-medium text-sm">{label}</span>
      {desc && <p className={cn("text-xs mt-1", selected ? "text-primary-foreground/80" : "text-muted-foreground")}>{desc}</p>}
    </button>
  );
}

export default function PublicRegister() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Existing registrations for autocomplete
  const [existingRegistrations, setExistingRegistrations] = useState<ExistingRegistration[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<ExistingRegistration[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedExisting, setSelectedExisting] = useState<ExistingRegistration | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Form fields
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState("");
  const [superpower, setSuperpower] = useState("");
  const [idealCopilot, setIdealCopilot] = useState("");
  const [offscreenLife, setOffscreenLife] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

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
      .select("id, name")
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
    setShowSuggestions(false);
    
    toast({
      title: "Profile found!",
      description: "Complete your details to update your registration",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!event) return;

    if (!name || !vibe || !superpower || !idealCopilot) {
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
      
      const registrationData = {
        name,
        role: superpower,
        interests: [vibe, idealCopilot, offscreenLife].filter(Boolean),
        telegram_handle: linkedinUrl || "",
        vibe,
        superpower,
        ideal_copilot: idealCopilot,
        offscreen_life: offscreenLife,
        bio,
        event_id: event.id,
      };

      if (selectedExisting) {
        // Update existing registration
        const { error } = await supabase
          .from("registrations")
          .update(registrationData)
          .eq("id", selectedExisting.id);

        if (error) throw error;
        resultId = selectedExisting.id;
      } else {
        // Create new registration
        const { data, error } = await supabase
          .from("registrations")
          .insert(registrationData)
          .select()
          .single();

        if (error) throw error;
        resultId = data.id;
      }

      // Store current user info in localStorage for personalized matching
      localStorage.setItem(`currentUser_${event.id}`, JSON.stringify({
        id: resultId,
        name,
        vibe,
        superpower,
        idealCopilot,
        offscreenLife,
        bio,
      }));
      
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
        <SparkleIcon className="text-muted-foreground mb-4" size={48} />
        <h2 className="font-serif text-xl font-medium text-foreground mb-2">Event not found</h2>
        <p className="text-muted-foreground">This registration link may be invalid or expired</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Network Background */}
      <div className="fixed inset-0 z-0 pointer-events-none text-charcoal opacity-[0.08]">
        <NetworkBackground />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="py-6">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3">
              <SparkleIcon className="text-primary" size={28} />
              <div>
                <h1 className="font-serif font-medium text-lg text-foreground">{event.name}</h1>
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
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-lg mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
                Find Your <span className="italic text-primary">Match</span>
              </h2>
              <p className="text-muted-foreground">
                {event.description || "Answer a few questions to connect with the right people"}
              </p>
            </div>

            <Card className="bg-card border-border">
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name with Autocomplete */}
                  <div className="space-y-2 relative" ref={suggestionsRef}>
                    <Label htmlFor="name" className="text-foreground/80">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      onFocus={() => name.length >= 3 && nameSuggestions.length > 0 && setShowSuggestions(true)}
                      className="bg-input border-border focus:border-primary"
                      autoComplete="off"
                    />
                    {selectedExisting && (
                      <p className="text-xs text-success flex items-center gap-1">
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
                                Click to update your registration
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* My Vibe */}
                  <div className="space-y-3">
                    <Label className="text-foreground/80">My Vibe - Which area excites you most? *</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {VIBE_OPTIONS.map((option) => (
                        <SelectButton
                          key={option.value}
                          selected={vibe === option.value}
                          onClick={() => setVibe(option.value)}
                          label={option.label}
                        />
                      ))}
                    </div>
                  </div>

                  {/* My Superpower */}
                  <div className="space-y-3">
                    <Label className="text-foreground/80">My Superpower (The "Give") *</Label>
                    <p className="text-xs text-muted-foreground -mt-1">I'm the one who...</p>
                    <div className="grid gap-2">
                      {SUPERPOWER_OPTIONS.map((option) => (
                        <SelectButton
                          key={option.value}
                          selected={superpower === option.value}
                          onClick={() => setSuperpower(option.value)}
                          label={option.label}
                          desc={option.desc}
                        />
                      ))}
                    </div>
                  </div>

                  {/* My Ideal Co-Pilot */}
                  <div className="space-y-3">
                    <Label className="text-foreground/80">My Ideal Co-Pilot (The "Get") *</Label>
                    <p className="text-xs text-muted-foreground -mt-1">I'm looking for a...</p>
                    <div className="grid gap-2">
                      {COPILOT_OPTIONS.map((option) => (
                        <SelectButton
                          key={option.value}
                          selected={idealCopilot === option.value}
                          onClick={() => setIdealCopilot(option.value)}
                          label={option.label}
                          desc={option.desc}
                        />
                      ))}
                    </div>
                  </div>

                  {/* My Off-Screen Life */}
                  <div className="space-y-3">
                    <Label className="text-foreground/80">My Off-Screen Life</Label>
                    <p className="text-xs text-muted-foreground -mt-1">Find me...</p>
                    <div className="grid grid-cols-2 gap-2">
                      {OFFSCREEN_OPTIONS.map((option) => (
                        <SelectButton
                          key={option.value}
                          selected={offscreenLife === option.value}
                          onClick={() => setOffscreenLife(option.value)}
                          label={option.label}
                          desc={option.desc}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-foreground/80">About You</Label>
                    <p className="text-xs text-muted-foreground -mt-1">Short intro to find your match</p>
                    <Textarea
                      id="bio"
                      placeholder="Tell us a bit about yourself, what you're working on, or what you're looking for..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="bg-input border-border focus:border-primary min-h-[80px]"
                      maxLength={300}
                    />
                    <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
                  </div>

                  {/* LinkedIn (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-foreground/80">LinkedIn Profile URL (Optional)</Label>
                    <Input
                      id="linkedin"
                      placeholder="https://linkedin.com/in/yourprofile"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      className="bg-input border-border focus:border-primary"
                    />
                  </div>

                  {/* Text link CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-link-cta justify-center py-4 border-t border-border/50 mt-6 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      "Finding your match..."
                    ) : (
                      <>
                        <SparkleIcon className="text-primary" size={20} />
                        Find My Match
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
