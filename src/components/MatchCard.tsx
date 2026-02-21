 import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Palette, Briefcase, ExternalLink, Sparkles, RefreshCw } from "lucide-react";

const ROLE_ICONS = {
  Dev: Code,
  Designer: Palette,
  Business: Briefcase,
};

interface MatchCardProps {
  matchName: string;
  matchRole: string;
  matchSummary: string;
  telegramHandle: string;
  onReset: () => void;
}

export function MatchCard({
  matchName,
  matchRole,
  matchSummary,
  telegramHandle,
  onReset,
}: MatchCardProps) {
  const RoleIcon = ROLE_ICONS[matchRole as keyof typeof ROLE_ICONS] || Code;

  const linkedInUrl = telegramHandle.startsWith("http")
    ? telegramHandle
    : `https://linkedin.com/in/${telegramHandle}`;

  return (
    <div className="space-y-6">
      {/* Success header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full border border-success/20 mb-4">
          <Sparkles className="w-4 h-4 text-success" />
          <span className="text-success font-medium">Match Found!</span>
        </div>
        <h2 className="font-serif text-2xl md:text-3xl font-medium text-foreground">
          Meet your collaborator
        </h2>
      </div>

      {/* Match card */}
      <Card className="border-primary/20 overflow-hidden">
        <CardHeader className="bg-card pb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <RoleIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="font-sans text-xl font-semibold text-foreground">{matchName}</h3>
              <Badge className="mt-1 bg-primary/10 text-primary border border-primary/20">
                <RoleIcon className="w-3 h-3 mr-1" />
                {matchRole}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="bg-card pt-0">
          {/* AI Summary */}
          <div className="bg-secondary rounded p-4 mb-6 border border-border">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-primary mb-2">Why we matched you</p>
                <p className="text-muted-foreground leading-relaxed font-serif italic">{matchSummary}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              asChild
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground glow-gold"
            >
              <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Connect on LinkedIn
              </a>
            </Button>
            <Button
              variant="outline"
              onClick={onReset}
              className="border-border hover:border-primary"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Registration
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
