 import { useEffect, useState } from "react";
 import { Search, Sparkles } from "lucide-react";
 
 const LOADING_TEXTS = [
   "Scanning hackathon participants...",
   "Analyzing skill matrices...",
   "Cross-referencing interests...",
   "Finding complementary roles...",
   "Calculating synergy scores...",
   "Almost there...",
 ];
 
 export function WaitingState() {
   const [textIndex, setTextIndex] = useState(0);
 
   useEffect(() => {
     const interval = setInterval(() => {
       setTextIndex((prev) => (prev + 1) % LOADING_TEXTS.length);
     }, 2500);
     return () => clearInterval(interval);
   }, []);
 
   return (
     <div className="flex flex-col items-center justify-center py-16 px-4">
       {/* Animated search icon with rings */}
       <div className="relative mb-8">
         <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring" />
         <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring [animation-delay:0.5s]" />
         <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse-ring [animation-delay:1s]" />
         <div className="relative z-10 w-24 h-24 rounded-full bg-card border-2 border-primary flex items-center justify-center glow-purple">
           <Search className="w-10 h-10 text-primary animate-float" />
         </div>
       </div>
 
       {/* Main text */}
       <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4 text-center">
         Searching for your perfect collaborator...
       </h2>
 
       {/* Animated status text */}
       <div className="h-8 flex items-center">
         <Sparkles className="w-4 h-4 text-accent mr-2" />
         <p className="text-muted-foreground animate-pulse">{LOADING_TEXTS[textIndex]}</p>
       </div>
 
       {/* Progress bar */}
       <div className="w-full max-w-xs mt-8">
         <div className="h-1 bg-muted rounded-full overflow-hidden">
           <div
             className="h-full rounded-full animate-shimmer"
             style={{
               background: "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
               backgroundSize: "200% 100%",
             }}
           />
         </div>
       </div>
 
       {/* Decorative elements */}
       <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-accent/40 animate-float" />
         <div className="absolute top-1/3 right-1/4 w-1 h-1 rounded-full bg-primary/40 animate-float [animation-delay:1s]" />
         <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 rounded-full bg-accent/30 animate-float [animation-delay:0.5s]" />
       </div>
     </div>
   );
 }