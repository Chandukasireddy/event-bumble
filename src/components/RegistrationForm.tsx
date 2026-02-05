import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

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

const FIND_ME_SUGGESTIONS = [
  "I'm wearing a blue jacket",
  "I have a red cap on",
  "I'm the one with glasses",
  "Look for the purple hoodie",
  "I'll be near the coffee station",
  "I'm wearing a band t-shirt",
  "I have a laptop sticker collection",
];

interface RegistrationFormProps {
  webhookUrl: string;
  onSubmitSuccess: (registrationId: string) => void;
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
        "w-full text-left p-3 rounded-lg border transition-all duration-200",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-secondary/50 hover:border-primary/50"
      )}
    >
      <span className="font-medium">{label}</span>
      {desc && <p className="text-xs text-muted-foreground mt-1">{desc}</p>}
    </button>
  );
}

export function RegistrationForm({ webhookUrl, onSubmitSuccess }: RegistrationFormProps) {
  const [name, setName] = useState("");
  const [vibe, setVibe] = useState("");
  const [superpower, setSuperpower] = useState("");
  const [idealCopilot, setIdealCopilot] = useState("");
  const [offscreenLife, setOffscreenLife] = useState("");
  const [bio, setBio] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [howToFindMe, setHowToFindMe] = useState("");
  const [currentSuggestion, setCurrentSuggestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Rotate suggestions
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSuggestion((prev) => (prev + 1) % FIND_ME_SUGGESTIONS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      const { data, error } = await supabase
        .from("registrations")
        .insert({
          name,
          role: superpower,
          interests: [vibe, idealCopilot, offscreenLife].filter(Boolean),
          telegram_handle: linkedinUrl || "",
          vibe,
          superpower,
          ideal_copilot: idealCopilot,
          offscreen_life: offscreenLife,
          bio,
          how_to_find_me: howToFindMe || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          mode: "no-cors",
          body: JSON.stringify({
            registration_id: data.id,
            name,
            vibe,
            superpower,
            ideal_copilot: idealCopilot,
            offscreen_life: offscreenLife,
            bio,
            linkedin_url: linkedinUrl,
            timestamp: new Date().toISOString(),
          }),
        });
      }

      toast({
        title: "Registration successful!",
        description: "Finding your perfect match...",
      });

      onSubmitSuccess(data.id);
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-foreground/80">Name *</Label>
        <Input
          id="name"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20"
        />
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
        <Label className="text-foreground/80">My Superpower (The "Give") - I'm the one who... *</Label>
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
        <Label className="text-foreground/80">My Ideal Co-Pilot (The "Get") - I'm looking for a... *</Label>
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
        <Label className="text-foreground/80">My Off-Screen Life - Find me...</Label>
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
        <Label htmlFor="bio" className="text-foreground/80">About You (Short intro to find your match)</Label>
        <Textarea
          id="bio"
          placeholder="Tell us a bit about yourself, what you're working on, or what you're looking for..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20 min-h-[80px]"
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
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20"
        />
      </div>

      {/* How to Find Me (Optional) */}
      <div className="space-y-2">
        <Label htmlFor="howToFindMe" className="text-foreground/80 flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          How to Find Me (Optional)
        </Label>
        <Input
          id="howToFindMe"
          placeholder={FIND_ME_SUGGESTIONS[currentSuggestion]}
          value={howToFindMe}
          onChange={(e) => setHowToFindMe(e.target.value)}
          className="bg-secondary border-border focus:border-primary focus:ring-primary/20"
        />
        <div className="flex flex-wrap gap-1.5 mt-2">
          {FIND_ME_SUGGESTIONS.slice(0, 4).map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setHowToFindMe(suggestion)}
              className="text-xs px-2 py-1 rounded-full bg-secondary/70 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground glow-purple transition-all duration-300"
      >
        {isSubmitting ? (
          "Registering..."
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Find My Match
          </>
        )}
      </Button>
    </form>
  );
}
