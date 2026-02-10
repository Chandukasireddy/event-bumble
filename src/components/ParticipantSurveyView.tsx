import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CheckCircle2, Pencil, ArrowRight, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ParticipantSurveyViewProps {
  eventId: string;
  participantId: string;
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

interface Registration {
  vibe: string | null;
  superpower: string | null;
  ideal_copilot: string | null;
  offscreen_life: string | null;
  bio: string | null;
  telegram_handle: string | null;
}

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

function getOptionLabel(options: { value: string; label: string }[], value: string | null) {
  if (!value) return "—";
  return options.find((o) => o.value === value)?.label || value;
}

export function ParticipantSurveyView({ eventId, participantId }: ParticipantSurveyViewProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  const [customResponses, setCustomResponses] = useState<Record<string, any>>({});
  const [editValues, setEditValues] = useState<Record<string, any>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [eventId, participantId]);

  const fetchData = async () => {
    const [regResult, questionsResult, responsesResult] = await Promise.all([
      supabase.from("registrations").select("vibe, superpower, ideal_copilot, offscreen_life, bio, telegram_handle").eq("id", participantId).maybeSingle(),
      supabase.from("event_questions").select("*").eq("event_id", eventId).order("sort_order", { ascending: true }),
      supabase.from("question_responses").select("question_id, response").eq("registration_id", participantId),
    ]);

    if (regResult.data) setRegistration(regResult.data);

    if (questionsResult.data && questionsResult.data.length > 0) {
      setCustomQuestions(questionsResult.data.map((q: any) => ({ ...q, options: q.options as string[] | null })));
    }

    if (responsesResult.data) {
      const map: Record<string, any> = {};
      responsesResult.data.forEach((r: any) => { map[r.question_id] = r.response; });
      setCustomResponses(map);
    }

    setIsLoading(false);
  };

  const startEditing = () => {
    if (customQuestions.length > 0) {
      setEditValues({ ...customResponses });
    } else {
      setEditValues({
        vibe: registration?.vibe || "",
        superpower: registration?.superpower || "",
        ideal_copilot: registration?.ideal_copilot || "",
        offscreen_life: registration?.offscreen_life || "",
        bio: registration?.bio || "",
      });
    }
    setIsEditing(true);
    setShowSuccess(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (customQuestions.length > 0) {
        await supabase.from("question_responses").delete().eq("registration_id", participantId);
        const rows = Object.entries(editValues)
          .filter(([, v]) => v !== undefined && v !== "" && v !== null)
          .map(([questionId, value]) => ({ registration_id: participantId, question_id: questionId, response: value }));
        if (rows.length > 0) {
          await supabase.from("question_responses").insert(rows);
        }
        setCustomResponses({ ...editValues });
      } else {
        await supabase.from("registrations").update({
          vibe: editValues.vibe || null,
          superpower: editValues.superpower || null,
          ideal_copilot: editValues.ideal_copilot || null,
          offscreen_life: editValues.offscreen_life || null,
          bio: editValues.bio || null,
        }).eq("id", participantId);
        setRegistration((prev) => prev ? { ...prev, ...editValues } : prev);
      }
      setIsEditing(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      console.error("Save error:", e);
      toast({ title: "Failed to save", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasCustom = customQuestions.length > 0;

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg font-medium text-foreground">Your Survey Answers</h3>
        {showSuccess && (
          <span className="text-sm text-success flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4" />
            Answers updated
          </span>
        )}
      </div>

      {hasCustom ? (
        <div className="space-y-5">
          {customQuestions.map((q) => {
            const savedValue = isEditing ? editValues[q.id] : customResponses[q.id];
            return (
              <div key={q.id} className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">{q.question_text}{q.is_required && " *"}</Label>
                {isEditing ? (
                  renderEditableQuestion(q, savedValue, (v) => setEditValues((prev) => ({ ...prev, [q.id]: v })))
                ) : (
                  <p className="text-sm text-muted-foreground">{formatDisplayValue(savedValue)}</p>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-5">
          <ReadOnlyField label="My Vibe" value={getOptionLabel(VIBE_OPTIONS, isEditing ? editValues.vibe : registration?.vibe || null)} />
          <ReadOnlyField label="My Superpower" value={getOptionLabel(SUPERPOWER_OPTIONS, isEditing ? editValues.superpower : registration?.superpower || null)} />
          <ReadOnlyField label="My Ideal Co-Pilot" value={getOptionLabel(COPILOT_OPTIONS, isEditing ? editValues.ideal_copilot : registration?.ideal_copilot || null)} />
          <ReadOnlyField label="My Off-Screen Life" value={getOptionLabel(OFFSCREEN_OPTIONS, isEditing ? editValues.offscreen_life : registration?.offscreen_life || null)} />
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-foreground">About You</Label>
            {isEditing ? (
              <Textarea
                value={editValues.bio || ""}
                onChange={(e) => setEditValues((prev) => ({ ...prev, bio: e.target.value }))}
                className="bg-input border-border focus:border-primary min-h-[80px]"
                maxLength={300}
              />
            ) : (
              <p className="text-sm text-muted-foreground">{registration?.bio || "—"}</p>
            )}
          </div>
        </div>
      )}

      <div className="pt-2">
        {isEditing ? (
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Answers"}
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={startEditing}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Answers
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-semibold text-foreground">{label}</Label>
      <p className="text-sm text-muted-foreground">{value}</p>
    </div>
  );
}

function formatDisplayValue(value: any): string {
  if (value === undefined || value === null || value === "") return "—";
  if (Array.isArray(value)) return value.join(", ") || "—";
  return String(value);
}

function renderEditableQuestion(
  question: CustomQuestion,
  value: any,
  onChange: (v: any) => void
) {
  switch (question.field_type) {
    case "text":
      return <Input value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder || ""} className="bg-input border-border focus:border-primary" />;
    case "textarea":
      return <Textarea value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder || ""} className="bg-input border-border focus:border-primary min-h-[80px]" maxLength={500} />;
    case "radio":
      return (
        <RadioGroup value={(value as string) || ""} onValueChange={onChange} className="grid gap-2">
          {(question.options || []).map((opt) => (
            <label key={opt} className={cn("flex items-center gap-3 p-3 rounded border transition-all cursor-pointer", value === opt ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent hover:border-primary/50")}>
              <RadioGroupItem value={opt} className={cn(value === opt && "border-primary-foreground text-primary-foreground")} />
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
              <label key={opt} className={cn("flex items-center gap-3 p-3 rounded border transition-all cursor-pointer", checked ? "border-primary bg-primary text-primary-foreground" : "border-border bg-transparent hover:border-primary/50")}>
                <Checkbox checked={checked} onCheckedChange={() => {
                  const current = (value as string[]) || [];
                  onChange(checked ? current.filter((o: string) => o !== opt) : [...current, opt]);
                }} className={cn(checked && "border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary")} />
                <span className="text-sm font-medium">{opt}</span>
              </label>
            );
          })}
        </div>
      );
    case "select":
      return (
        <Select value={(value as string) || ""} onValueChange={onChange}>
          <SelectTrigger className="bg-input border-border"><SelectValue placeholder={question.placeholder || "Select an option"} /></SelectTrigger>
          <SelectContent>{(question.options || []).map((opt) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}</SelectContent>
        </Select>
      );
    case "number":
      return <Input type="number" value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder || ""} className="bg-input border-border focus:border-primary" />;
    case "rating":
      return (
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => onChange(star)} className="p-1">
              <Star className={cn("w-6 h-6 transition-colors", star <= (value || 0) ? "fill-primary text-primary" : "text-muted-foreground/40")} />
            </button>
          ))}
        </div>
      );
    default:
      return <Input value={(value as string) || ""} onChange={(e) => onChange(e.target.value)} placeholder={question.placeholder || ""} className="bg-input border-border focus:border-primary" />;
  }
}
