import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  GripVertical,
  ArrowRight,
  Sparkles,
  Type,
  AlignLeft,
  CircleDot,
  CheckSquare,
  List,
  Hash,
  Star,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SparkleIcon } from "@/components/icons/GeometricIcons";

interface EventQuestion {
  id?: string;
  event_id: string;
  question_text: string;
  field_type: string;
  options: string[] | null;
  is_required: boolean;
  sort_order: number;
  placeholder: string | null;
}

const FIELD_TYPES = [
  { value: "text", label: "Short Text", icon: Type, desc: "Single line input" },
  { value: "textarea", label: "Long Text", icon: AlignLeft, desc: "Multi-line paragraph" },
  { value: "radio", label: "Single Choice", icon: CircleDot, desc: "Pick one option" },
  { value: "checkbox", label: "Multiple Choice", icon: CheckSquare, desc: "Pick multiple options" },
  { value: "select", label: "Dropdown", icon: List, desc: "Select from a list" },
  { value: "number", label: "Number", icon: Hash, desc: "Numeric input" },
  { value: "rating", label: "Rating (1-5)", icon: Star, desc: "Star rating scale" },
];

interface FormBuilderProps {
  eventId: string;
  eventName: string;
  eventDescription: string | null;
}

export function FormBuilder({ eventId, eventName, eventDescription }: FormBuilderProps) {
  const [questions, setQuestions] = useState<EventQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuestions();
  }, [eventId]);

  const fetchQuestions = async () => {
    const { data, error } = await supabase
      .from("event_questions")
      .select("*")
      .eq("event_id", eventId)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Error fetching questions:", error);
    } else {
      setQuestions(
        (data || []).map((q: any) => ({
          ...q,
          options: q.options as string[] | null,
        }))
      );
    }
    setIsLoading(false);
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        event_id: eventId,
        question_text: "",
        field_type: "text",
        options: null,
        is_required: false,
        sort_order: prev.length,
        placeholder: null,
      },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<EventQuestion>) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...updates } : q))
    );
  };

  const removeQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const addOption = (questionIndex: number) => {
    const q = questions[questionIndex];
    const opts = q.options || [];
    updateQuestion(questionIndex, { options: [...opts, `Option ${opts.length + 1}`] });
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const q = questions[questionIndex];
    const opts = [...(q.options || [])];
    opts[optionIndex] = value;
    updateQuestion(questionIndex, { options: opts });
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const q = questions[questionIndex];
    const opts = (q.options || []).filter((_, i) => i !== optionIndex);
    updateQuestion(questionIndex, { options: opts });
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === questions.length - 1) return;

    const newQuestions = [...questions];
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    [newQuestions[index], newQuestions[swapIndex]] = [newQuestions[swapIndex], newQuestions[index]];
    newQuestions.forEach((q, i) => (q.sort_order = i));
    setQuestions(newQuestions);
  };

  const saveQuestions = async () => {
    setIsSaving(true);

    // Validate
    const invalid = questions.find((q) => !q.question_text.trim());
    if (invalid) {
      toast({ title: "All questions must have text", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    const needsOptions = questions.find(
      (q) => ["radio", "checkbox", "select"].includes(q.field_type) && (!q.options || q.options.length < 2)
    );
    if (needsOptions) {
      toast({ title: "Choice questions need at least 2 options", variant: "destructive" });
      setIsSaving(false);
      return;
    }

    try {
      // Delete existing questions for this event
      await supabase.from("event_questions").delete().eq("event_id", eventId);

      // Insert all questions
      if (questions.length > 0) {
        const toInsert = questions.map((q, i) => ({
          event_id: eventId,
          question_text: q.question_text,
          field_type: q.field_type,
          options: q.options,
          is_required: q.is_required,
          sort_order: i,
          placeholder: q.placeholder,
        }));

        const { error } = await supabase.from("event_questions").insert(toInsert);
        if (error) throw error;
      }

      toast({ title: "Questions saved!" });
      fetchQuestions();
    } catch (error) {
      console.error("Save error:", error);
      toast({ title: "Failed to save questions", variant: "destructive" });
    }

    setIsSaving(false);
  };

  const generateWithAI = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-form", {
        body: { eventName, eventDescription },
      });

      if (error) throw error;

      if (data?.questions) {
        const aiQuestions: EventQuestion[] = data.questions.map((q: any, i: number) => ({
          event_id: eventId,
          question_text: q.question_text,
          field_type: q.field_type,
          options: q.options || null,
          is_required: q.is_required ?? false,
          sort_order: i,
          placeholder: q.placeholder || null,
        }));
        setQuestions(aiQuestions);
        toast({ title: "AI generated questions!", description: "Review and save when ready." });
      }
    } catch (error) {
      console.error("AI generation error:", error);
      toast({ title: "AI generation failed", description: "Please try again", variant: "destructive" });
    }
    setIsGenerating(false);
  };

  const needsOptions = (type: string) => ["radio", "checkbox", "select"].includes(type);
  const getFieldIcon = (type: string) => {
    const found = FIELD_TYPES.find((f) => f.value === type);
    return found ? found.icon : Type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="font-serif text-xl font-medium text-foreground">Survey Questions</h3>
          <p className="text-sm text-muted-foreground">
            Customize the registration form for this event
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={generateWithAI}
            disabled={isGenerating}
            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 min-h-[44px]"
          >
            <Sparkles className="w-4 h-4" />
            {isGenerating ? "Generating..." : "AI Generate"}
          </button>
          <button
            onClick={addQuestion}
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            Add Question
          </button>
        </div>
      </div>

      {/* Questions list */}
      {questions.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-border rounded">
          <SparkleIcon className="text-muted-foreground mx-auto mb-4" size={36} />
          <h4 className="font-serif text-lg text-foreground mb-2">No custom questions yet</h4>
          <p className="text-sm text-muted-foreground mb-6">
            Add questions manually or let AI create them for you
          </p>
          <div className="flex gap-4 justify-center">
            <button onClick={generateWithAI} disabled={isGenerating} className="text-link-cta text-base">
              <Sparkles className="w-4 h-4" />
              {isGenerating ? "Generating..." : "AI Generate"}
            </button>
            <button onClick={addQuestion} className="text-link-cta text-base">
              <Plus className="w-4 h-4" />
              Add Manually
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => {
            const FieldIcon = getFieldIcon(question.field_type);
            return (
              <div
                key={index}
                className="border border-border/50 p-5 space-y-4 bg-card"
              >
                {/* Question header */}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <button
                      onClick={() => moveQuestion(index, "up")}
                      disabled={index === 0}
                      className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-0.5"
                    >
                      <GripVertical className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-muted-foreground font-medium">{index + 1}</span>
                  </div>

                  <div className="flex-1 space-y-3">
                    {/* Question text */}
                    <Input
                      value={question.question_text}
                      onChange={(e) => updateQuestion(index, { question_text: e.target.value })}
                      placeholder="Enter your question..."
                      className="bg-input border-border focus:border-primary font-medium"
                    />

                    {/* Field type + settings row */}
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="flex items-center gap-2">
                        <FieldIcon className="w-4 h-4 text-muted-foreground" />
                        <Select
                          value={question.field_type}
                          onValueChange={(value) => {
                            const updates: Partial<EventQuestion> = { field_type: value };
                            if (needsOptions(value) && !question.options) {
                              updates.options = ["Option 1", "Option 2"];
                            }
                            updateQuestion(index, updates);
                          }}
                        >
                          <SelectTrigger className="w-[160px] h-8 text-xs bg-transparent border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {FIELD_TYPES.map((ft) => (
                              <SelectItem key={ft.value} value={ft.value}>
                                <span className="flex items-center gap-2">
                                  <ft.icon className="w-3 h-3" />
                                  {ft.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={question.is_required}
                          onCheckedChange={(checked) => updateQuestion(index, { is_required: checked })}
                          className="scale-75"
                        />
                        <span className="text-xs text-muted-foreground">Required</span>
                      </div>

                      <Input
                        value={question.placeholder || ""}
                        onChange={(e) => updateQuestion(index, { placeholder: e.target.value || null })}
                        placeholder="Placeholder text..."
                        className="flex-1 h-8 text-xs bg-transparent border-border min-w-[150px]"
                      />
                    </div>

                    {/* Options for choice fields */}
                    {needsOptions(question.field_type) && (
                      <div className="space-y-2 pl-4 border-l-2 border-primary/20">
                        <Label className="text-xs text-muted-foreground">Options</Label>
                        {(question.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border border-muted-foreground/50 flex-shrink-0" />
                            <Input
                              value={opt}
                              onChange={(e) => updateOption(index, optIdx, e.target.value)}
                              className="h-8 text-sm bg-transparent border-border flex-1"
                            />
                            <button
                              onClick={() => removeOption(index, optIdx)}
                              className="text-muted-foreground hover:text-destructive p-1"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addOption(index)}
                          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Add Option
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => removeQuestion(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Save button */}
      {questions.length > 0 && (
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <button onClick={addQuestion} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
            <Plus className="w-4 h-4" />
            Add Question
          </button>
          <button
            onClick={saveQuestions}
            disabled={isSaving}
            className="text-link-cta"
          >
            {isSaving ? "Saving..." : "Save Questions"}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
