 import { Card, CardContent, CardHeader } from "@/components/ui/card";
 import { Badge } from "@/components/ui/badge";
 import { Button } from "@/components/ui/button";
 import { Code, Palette, Briefcase, MessageCircle, Sparkles, RefreshCw } from "lucide-react";
 
 const ROLE_ICONS = {
   Dev: Code,
   Designer: Palette,
   Business: Briefcase,
 };
 
 const ROLE_COLORS = {
   Dev: "text-accent",
   Designer: "text-primary",
   Business: "text-amber-400",
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
   const roleColor = ROLE_COLORS[matchRole as keyof typeof ROLE_COLORS] || "text-primary";
 
   const telegramUrl = telegramHandle.startsWith("@")
     ? `https://t.me/${telegramHandle.slice(1)}`
     : `https://t.me/${telegramHandle}`;
 
   return (
     <div className="space-y-6">
       {/* Success header */}
       <div className="text-center">
         <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full border border-accent/30 mb-4">
           <Sparkles className="w-4 h-4 text-accent" />
           <span className="text-accent font-medium">Match Found!</span>
         </div>
         <h2 className="text-2xl md:text-3xl font-bold text-foreground">
           Meet your collaborator
         </h2>
       </div>
 
       {/* Match card */}
       <Card className="gradient-border rounded-xl overflow-hidden">
         <div className="gradient-border-inner rounded-xl p-1">
           <CardHeader className="bg-card rounded-t-lg pb-4">
             <div className="flex items-center gap-4">
               <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-primary/30">
                 <RoleIcon className={`w-8 h-8 ${roleColor}`} />
               </div>
               <div>
                 <h3 className="text-xl font-bold text-foreground">{matchName}</h3>
                 <Badge variant="secondary" className="mt-1 bg-secondary border-muted-foreground/30">
                   <RoleIcon className={`w-3 h-3 mr-1 ${roleColor}`} />
                   {matchRole}
                 </Badge>
               </div>
             </div>
           </CardHeader>
 
           <CardContent className="bg-card rounded-b-lg pt-0">
             {/* AI Summary */}
             <div className="bg-muted/50 rounded-lg p-4 mb-6 border border-border">
               <div className="flex items-start gap-3">
                 <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                 <div>
                   <p className="text-sm font-medium text-primary mb-2">Why we matched you</p>
                   <p className="text-muted-foreground leading-relaxed">{matchSummary}</p>
                 </div>
               </div>
             </div>
 
             {/* Action buttons */}
             <div className="flex flex-col sm:flex-row gap-3">
               <Button
                 asChild
                 className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground glow-green"
               >
                 <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
                   <MessageCircle className="w-4 h-4 mr-2" />
                   Connect on Telegram
                 </a>
               </Button>
               <Button
                 variant="outline"
                 onClick={onReset}
                 className="border-muted-foreground/30 hover:border-primary hover:text-primary"
               >
                 <RefreshCw className="w-4 h-4 mr-2" />
                 New Registration
               </Button>
             </div>
           </CardContent>
         </div>
       </Card>
     </div>
   );
 }