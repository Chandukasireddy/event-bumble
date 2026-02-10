import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, CheckCircle2, User, ArrowRight, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { SparkleIcon } from "@/components/icons/GeometricIcons";
import { NetworkBackground } from "@/components/NetworkBackground";
import { CornerBracket, CornerBracketFlipped } from "@/components/icons/DecorativeLines";

// Default question options (used when no custom questions exist)
const VIBE_OPTIONS = [
  { value: "productivity", label: "⚡ Productivity & Automation" },
  { value: "creative", label: "🎨 Creative Arts (Media/Music)" },
  { value: "health", label: "🏥 Health & Wellness" },
  { value: "social", label: "🌍 Social Impact" },
  { value: "knowledge", label: '🧠 Knowledge & "Second Brains"' },
  { value: "fintech", label: "💰 FinTech & Money" },
  { value: "education", label: "💼 Education & Jobs" },
  { value: "shopping", label: "🛒 Shopping & Retail" },
  { value: "infrastructure", label: '🛠️ Infrastructure (The "Pipes")' },
  { value: "gaming", label: "🎮 Gaming & Entertainment" },
];

const SUPERPOWER_OPTIONS = [
  { value: "builds", label: "💻 Builds", desc: "I handle the code and technical logic." },
  { value: "shapes", label: "🎨 Shapes", desc: 'I handle the design, UX, and "feel."' },
  { value: "plans", label: "📈 Plans", desc: "I handle the strategy and market fit." },
  { value: "speaks", label: "🗣️ Speaks", desc: "I handle the story and the pitch." },
];

const COPILOT_OPTIONS = [
  { value: "technical", label: "🛠️ Technical Engine", desc: 'Someone to build the "guts" and solve the logic.' },
  { value: "creative", label: "🌈 Creative Spark", desc: "Someone to make it beautiful and human-centric." },
  { value: "strategic", label: "🗺️ Strategic Guide", desc: 'Someone to find the problem and the "why."' },
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

interface CustomQuestion {
  id: string;
  question_text: string;
  field_type: string;
  options: string[] | null;
  is_required: boolean;
  sort_order: number;
  placeholder: string | null;
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
          : "border-border bg-transparent hover:border-primary/50",
      )}
    >
      <span className="font-medium text-sm">{label}</span>
      {desc && (
        <p className={cn("text-xs mt-1", selected ? "text-primary-foreground/80" : "text-muted-foreground")}>{desc}</p>
      )}
    </button>
  );
}

function RatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)} className="p-1">
          <Star
            className={cn(
              "w-6 h-6 transition-colors",
              star <= value ? "fill-primary text-primary" : "text-muted-foreground/40",
            )}
          />
        </button>
      ))}
    </div>
  );
}

export default function PublicRegister() {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [hasCustomQuestions, setHasCustomQuestions] = useState(false);

  // Existing registrations for autocomplete
  const [existingRegistrations, setExistingRegistrations] = useState<ExistingRegistration[]>([]);
  const [nameSuggestions, setNameSuggestions] = useState<ExistingRegistration[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  const [welcomeBackReg, setWelcomeBackReg] = useState<ExistingRegistration | null>(null);
  const [selectedExisting, setSelectedExisting] = useState<ExistingRegistration | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Default form fields
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState("");
  const [superpower, setSuperpower] = useState("");
  const [idealCopilot, setIdealCopilot] = useState("");
  const [offscreenLife, setOffscreenLife] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  // Custom question responses
  const [customResponses, setCustomResponses] = useState<Record<string, any>>({});

  const { toast } = useToast();

  useEffect(() => {
    if (shareCode) fetchEvent();
  }, [shareCode]);

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
    const { data, error } = await supabase.from("events").select("*").eq("share_code", shareCode).maybeSingle();

    if (error || !data) {
      console.error("Error fetching event:", error);
      setIsLoading(false);
      return;
    }

    setEvent(data);

    // Fetch custom questions and registrations in parallel
    const [questionsResult, registrationsResult] = await Promise.all([
      supabase.from("event_questions").select("*").eq("event_id", data.id).order("sort_order", { ascending: true }),
      supabase.from("registrations").select("id, name").eq("event_id", data.id),
    ]);

    if (questionsResult.data && questionsResult.data.length > 0) {
      setCustomQuestions(
        questionsResult.data.map((q: any) => ({
          ...q,
          options: q.options as string[] | null,
        })),
      );
      setHasCustomQuestions(true);
    }

    if (registrationsResult.data) {
      setExistingRegistrations(registrationsResult.data);
    }

    setIsLoading(false);
  };

  const handleNameChange = (value: string) => {
    setName(value);
    setSelectedExisting(null);
    if (value.length >= 3) {
      const matches = existingRegistrations.filter((reg) => reg.name.toLowerCase().includes(value.toLowerCase()));
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
    setWelcomeBackReg(reg);
    setShowWelcomeBack(true);
  };
  const setCustomResponse = (questionId: string, value: any) => {
    setCustomResponses((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleCheckboxOption = (questionId: string, option: string) => {
    setCustomResponses((prev) => {
      const current = (prev[questionId] as string[]) || [];
      const updated = current.includes(option) ? current.filter((o) => o !== option) : [...current, option];
      return { ...prev, [questionId]: updated };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    if (!name) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    // Validate required custom questions
    if (hasCustomQuestions) {
      const missingRequired = customQuestions.find((q) => q.is_required && !customResponses[q.id]);
      if (missingRequired) {
        toast({ title: `Please answer: ${missingRequired.question_text}`, variant: "destructive" });
        return;
      }
    } else {
      if (!vibe || !superpower || !idealCopilot) {
        toast({ title: "Please fill in all required fields", variant: "destructive" });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      let resultId: string;

      // Build interests from either custom or default
      const interests = hasCustomQuestions
        ? Object.values(customResponses)
            .flat()
            .filter((v) => typeof v === "string")
            .slice(0, 5)
        : [vibe, idealCopilot, offscreenLife].filter(Boolean);

      const registrationData = {
        name,
        role: hasCustomQuestions ? "participant" : superpower,
        interests: interests as string[],
        telegram_handle: linkedinUrl || "",
        vibe: hasCustomQuestions ? null : vibe,
        superpower: hasCustomQuestions ? null : superpower,
        ideal_copilot: hasCustomQuestions ? null : idealCopilot,
        offscreen_life: hasCustomQuestions ? null : offscreenLife,
        bio: hasCustomQuestions ? null : bio,
        event_id: event.id,
      };

      if (selectedExisting) {
        const { error } = await supabase.from("registrations").update(registrationData).eq("id", selectedExisting.id);
        if (error) throw error;
        resultId = selectedExisting.id;
      } else {
        const { data, error } = await supabase.from("registrations").insert(registrationData).select().single();
        if (error) throw error;
        resultId = data.id;
      }

      // Save custom question responses
      if (hasCustomQuestions) {
        // Delete old responses if updating
        if (selectedExisting) {
          await supabase.from("question_responses").delete().eq("registration_id", resultId);
        }

        const responseRows = Object.entries(customResponses)
          .filter(([, value]) => value !== undefined && value !== "" && value !== null)
          .map(([questionId, value]) => ({
            registration_id: resultId,
            question_id: questionId,
            response: value,
          }));

        if (responseRows.length > 0) {
          const { error: respError } = await supabase.from("question_responses").insert(responseRows);
          if (respError) console.error("Error saving responses:", respError);
        }
      }

      localStorage.setItem(
        `currentUser_${event.id}`,
        JSON.stringify({
          id: resultId,
          name,
          vibe: vibe || null,
          superpower: superpower || null,
          idealCopilot: idealCopilot || null,
          offscreenLife: offscreenLife || null,
          bio: bio || null,
        }),
      );

      toast({
        title: selectedExisting ? "Profile updated!" : "Registration successful!",
        description: "Redirecting to event dashboard...",
      });
      navigate(`/event/${event.id}`);
    } catch (error) {
      console.error("Registration error:", error);
      toast({ title: "Registration failed", description: "Please try again", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCustomQuestion = (question: CustomQuestion) => {
    const value = customResponses[question.id];

    switch (question.field_type) {
      case "text":
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => setCustomResponse(question.id, e.target.value)}
            placeholder={question.placeholder || ""}
            className="bg-input border-border focus:border-primary"
          />
        );

      case "textarea":
        return (
          <Textarea
            value={(value as string) || ""}
            onChange={(e) => setCustomResponse(question.id, e.target.value)}
            placeholder={question.placeholder || ""}
            className="bg-input border-border focus:border-primary min-h-[80px]"
            maxLength={500}
          />
        );

      case "radio":
        return (
          <RadioGroup
            value={(value as string) || ""}
            onValueChange={(v) => setCustomResponse(question.id, v)}
            className="grid gap-2"
          >
            {(question.options || []).map((opt) => (
              <label
                key={opt}
                className={cn(
                  "flex items-center gap-3 p-3 rounded border transition-all cursor-pointer",
                  value === opt
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-transparent hover:border-primary/50",
                )}
              >
                <RadioGroupItem
                  value={opt}
                  className={cn(value === opt && "border-primary-foreground text-primary-foreground")}
                />
                <span className="text-sm font-medium">{opt}</span>
              </label>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="grid gap-2">
            {(question.options || []).map((opt) => {
              const checked = ((value as string[]) || []).includes(opt);
              return (
                <label
                  key={opt}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded border transition-all cursor-pointer",
                    checked
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-transparent hover:border-primary/50",
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => toggleCheckboxOption(question.id, opt)}
                    className={cn(
                      checked &&
                        "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary",
                    )}
                  />
                  <span className="text-sm font-medium">{opt}</span>
                </label>
              );
            })}
          </div>
        );

      case "select":
        return (
          <Select value={(value as string) || ""} onValueChange={(v) => setCustomResponse(question.id, v)}>
            <SelectTrigger className="bg-input border-border">
              <SelectValue placeholder={question.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {(question.options || []).map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "number":
        return (
          <Input
            type="number"
            value={(value as string) || ""}
            onChange={(e) => setCustomResponse(question.id, e.target.value)}
            placeholder={question.placeholder || ""}
            className="bg-input border-border focus:border-primary"
          />
        );

      case "rating":
        return <RatingInput value={(value as number) || 0} onChange={(v) => setCustomResponse(question.id, v)} />;

      default:
        return (
          <Input
            value={(value as string) || ""}
            onChange={(e) => setCustomResponse(question.id, e.target.value)}
            placeholder={question.placeholder || ""}
            className="bg-input border-border focus:border-primary"
          />
        );
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
      <div className="fixed inset-0 z-0 pointer-events-none text-charcoal opacity-[0.12]">
        <NetworkBackground />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
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

            {showWelcomeBack && welcomeBackReg ? (
              <Card className="bg-card border-border">
                <CardContent className="pt-6 text-center space-y-4">
                  <p className="text-lg font-serif text-foreground">{welcomeBackReg.name}, welcome back!</p>
                  <p className="text-sm text-muted-foreground">Would you like to skip straight to your dashboard?</p>
                  <div className="flex flex-col gap-3 items-center pt-2">
                    <button
                      type="button"
                      className="text-sm font-medium text-primary hover:underline"
                      onClick={() => {
                        if (event) {
                          localStorage.setItem(
                            `meetspark_participant_${event.id}`,
                            JSON.stringify({
                              participantId: welcomeBackReg.id,
                              name: welcomeBackReg.name,
                              eventId: event.id,
                            }),
                          );
                          localStorage.setItem(
                            `currentUser_${event.id}`,
                            JSON.stringify({
                              id: welcomeBackReg.id,
                              name: welcomeBackReg.name,
                              isOrganizer: false,
                            }),
                          );
                          navigate(`/event/${event.id}`);
                        }
                      }}
                    >
                      Go to Dashboard →
                    </button>
                    <button
                      type="button"
                      className="text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setShowWelcomeBack(false)}
                    >
                      Re-take survey
                    </button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name with Autocomplete */}
                    <div className="space-y-2 relative" ref={suggestionsRef}>
                      <Label htmlFor="name" className="text-foreground/80">
                        Name *
                      </Label>
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
                                <p className="text-xs text-muted-foreground">Click to update your registration</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Custom questions OR default questions */}
                    {hasCustomQuestions ? (
                      <>
                        {customQuestions.map((question) => (
                          <div key={question.id} className="space-y-3">
                            <Label className="text-foreground/80">
                              {question.question_text}
                              {question.is_required && " *"}
                            </Label>
                            {renderCustomQuestion(question)}
                          </div>
                        ))}
                      </>
                    ) : (
                      <>
                        {/* Default: My Vibe */}
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

                        {/* Default: My Superpower */}
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

                        {/* Default: My Ideal Co-Pilot */}
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

                        {/* Default: My Off-Screen Life */}
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

                        {/* Default: Bio */}
                        <div className="space-y-2">
                          <Label htmlFor="bio" className="text-foreground/80">
                            About You
                          </Label>
                          <p className="text-xs text-muted-foreground -mt-1">Short intro to find your match</p>
                          <Textarea
                            id="bio"
                            placeholder="Tell us a bit about yourself..."
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="bg-input border-border focus:border-primary min-h-[80px]"
                            maxLength={300}
                          />
                          <p className="text-xs text-muted-foreground text-right">{bio.length}/300</p>
                        </div>

                        {/* Default: LinkedIn */}
                        <div className="space-y-2">
                          <Label htmlFor="linkedin" className="text-foreground/80">
                            LinkedIn Profile URL (Optional)
                          </Label>
                          <Input
                            id="linkedin"
                            placeholder="https://linkedin.com/in/yourprofile"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            className="bg-input border-border focus:border-primary"
                          />
                        </div>
                      </>
                    )}

                    {/* Submit */}
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
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
