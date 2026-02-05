import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Code, Palette, Briefcase, X, Save, ArrowLeft, Edit2 } from "lucide-react";
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

interface Registration {
  id: string;
  name: string;
  role: string;
  interests: string[];
  telegram_handle: string;
  event_id: string | null;
}

export default function Profile() {
  const { registrationId } = useParams<{ registrationId: string }>();
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("");
  const [interests, setInterests] = useState<string[]>([]);
  const [telegramHandle, setTelegramHandle] = useState("");
  const [customInterest, setCustomInterest] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (registrationId) {
      fetchRegistration();
    }
  }, [registrationId]);

  const fetchRegistration = async () => {
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .eq("id", registrationId)
      .maybeSingle();

    if (error || !data) {
      console.error("Error fetching registration:", error);
    } else {
      setRegistration(data);
      setName(data.name);
      setRole(data.role);
      setInterests(data.interests);
      setTelegramHandle(data.telegram_handle);
    }
    setIsLoading(false);
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

  const handleSave = async () => {
    if (!registration) return;

    if (!name || !role || interests.length === 0 || !telegramHandle) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("registrations")
        .update({
          name,
          role,
          interests,
          telegram_handle: telegramHandle,
        })
        .eq("id", registration.id);

      if (error) throw error;

      setRegistration({
        ...registration,
        name,
        role,
        interests,
        telegram_handle: telegramHandle,
      });
      setIsEditing(false);
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved",
      });
    } catch (error) {
      console.error("Update error:", error);
      toast({
        title: "Update failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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

  if (!registration) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Zap className="w-12 h-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-bold text-foreground mb-2">Profile not found</h2>
        <p className="text-muted-foreground">This profile may not exist</p>
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
            <div className="flex items-center gap-4">
              {registration.event_id && (
                <Button asChild variant="ghost" size="icon">
                  <Link to={`/event/${registration.event_id}`}>
                    <ArrowLeft className="w-5 h-5" />
                  </Link>
                </Button>
              )}
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-purple">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="font-bold text-lg text-foreground">Your Profile</h1>
                  <p className="text-xs text-muted-foreground">Manage your networking profile</p>
                </div>
              </div>
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline" className="border-muted-foreground/30">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center">
          <div className="w-full max-w-md">
            <Card className="bg-card/50 border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  {RoleIcon && <RoleIcon className="w-5 h-5 text-primary" />}
                  {isEditing ? "Edit Profile" : registration.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground/80">Name</Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="bg-secondary border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role" className="text-foreground/80">Role</Label>
                      <Select value={role} onValueChange={setRole}>
                        <SelectTrigger className="bg-secondary border-border">
                          <SelectValue>
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
                      <Label className="text-foreground/80">Interests</Label>
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
                      <Label htmlFor="telegram" className="text-foreground/80">Telegram Handle</Label>
                      <Input
                        id="telegram"
                        value={telegramHandle}
                        onChange={(e) => setTelegramHandle(e.target.value)}
                        className="bg-secondary border-border"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setName(registration.name);
                          setRole(registration.role);
                          setInterests(registration.interests);
                          setTelegramHandle(registration.telegram_handle);
                        }}
                        className="flex-1 border-muted-foreground/30"
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 bg-primary hover:bg-primary/90"
                      >
                        {isSaving ? "Saving..." : (
                          <>
                            <Save className="w-4 h-4 mr-2" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Role</p>
                      <p className="text-foreground font-medium flex items-center gap-2">
                        {RoleIcon && <RoleIcon className="w-4 h-4 text-primary" />}
                        {registration.role}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Interests</p>
                      <div className="flex flex-wrap gap-2">
                        {registration.interests.map((interest) => (
                          <Badge
                            key={interest}
                            variant="secondary"
                            className="bg-primary/20 text-primary border border-primary/30"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Telegram</p>
                      <p className="text-foreground font-medium">{registration.telegram_handle}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
