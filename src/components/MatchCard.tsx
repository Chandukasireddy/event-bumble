import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Code, Palette, Briefcase, ExternalLink, RefreshCw } from "lucide-react";
import { SparkleIcon } from "@/components/icons/GeometricIcons";

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
    <div className="space-y-8 text-center max-w-lg mx-auto">
      {/* Success header */}
      <div>
        <div className="inline-flex items-center gap-2 text-success mb-4">
          <SparkleIcon className="text-success" size={20} />
          <span className="text-sm font-medium">Match Found!</span>
        </div>
        <h2 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
          Meet your collaborator
        </h2>
      </div>

      {/* Match info - no box */}
      <div className="py-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <RoleIcon className="w-6 h-6 text-primary" />
          <h3 className="font-serif text-2xl font-medium text-foreground">{matchName}</h3>
        </div>
        
        <Badge variant="outline" className="border-primary/30 text-primary mb-6">
          {matchRole}
        </Badge>

        {/* AI Summary */}
        <div className="mt-8">
          <p className="text-xs text-primary mb-2 font-medium">Why we matched you</p>
          <p className="text-muted-foreground leading-relaxed font-serif italic text-lg">
            "{matchSummary}"
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
        >
          <a href={linkedInUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Connect on LinkedIn
          </a>
        </Button>
        <button
          onClick={onReset}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          New Registration
        </button>
      </div>
    </div>
  );
}
