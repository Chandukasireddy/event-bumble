 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { Input } from "@/components/ui/input";
 import { Label } from "@/components/ui/label";
 import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
 } from "@/components/ui/select";
 import { Badge } from "@/components/ui/badge";
 import { Code, Palette, Briefcase, X, Send } from "lucide-react";
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
 
 interface RegistrationFormProps {
   webhookUrl: string;
   onSubmitSuccess: (registrationId: string) => void;
 }
 
 export function RegistrationForm({ webhookUrl, onSubmitSuccess }: RegistrationFormProps) {
   const [name, setName] = useState("");
   const [role, setRole] = useState<string>("");
   const [interests, setInterests] = useState<string[]>([]);
   const [telegramHandle, setTelegramHandle] = useState("");
   const [customInterest, setCustomInterest] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   const { toast } = useToast();
 
   const addInterest = (interest: string) => {
     if (interest && !interests.includes(interest) && interests.length < 5) {
       setInterests([...interests, interest]);
       setCustomInterest("");
     }
   };
 
   const removeInterest = (interest: string) => {
     setInterests(interests.filter((i) => i !== interest));
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
 
     if (!name || !role || interests.length === 0 || !telegramHandle) {
       toast({
         title: "Missing fields",
         description: "Please fill in all required fields",
         variant: "destructive",
       });
       return;
     }
 
     setIsSubmitting(true);
 
     try {
       // Insert into database
       const { data, error } = await supabase
         .from("registrations")
         .insert({
           name,
           role,
           interests,
           telegram_handle: telegramHandle,
         })
         .select()
         .single();
 
       if (error) throw error;
 
       // Send to webhook
       if (webhookUrl) {
         await fetch(webhookUrl, {
           method: "POST",
           headers: { "Content-Type": "application/json" },
           mode: "no-cors",
           body: JSON.stringify({
             registration_id: data.id,
             name,
             role,
             interests,
             telegram_handle: telegramHandle,
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
 
   const RoleIcon = role ? ROLE_ICONS[role as keyof typeof ROLE_ICONS] : null;
 
   return (
     <form onSubmit={handleSubmit} className="space-y-6">
       <div className="space-y-2">
         <Label htmlFor="name" className="text-foreground/80">Name</Label>
         <Input
           id="name"
           placeholder="Your name"
           value={name}
           onChange={(e) => setName(e.target.value)}
           className="bg-secondary border-border focus:border-primary focus:ring-primary/20"
         />
       </div>
 
       <div className="space-y-2">
         <Label htmlFor="role" className="text-foreground/80">Role</Label>
         <Select value={role} onValueChange={setRole}>
           <SelectTrigger className="bg-secondary border-border focus:border-primary">
             <SelectValue placeholder="Select your role">
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
         <Label className="text-foreground/80">Interests (select up to 5)</Label>
         <div className="flex flex-wrap gap-2 mb-3">
           {interests.map((interest) => (
             <Badge
               key={interest}
               variant="secondary"
               className="bg-primary/20 text-primary border border-primary/30 cursor-pointer hover:bg-primary/30 transition-colors"
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
               className="cursor-pointer border-muted-foreground/30 hover:border-accent hover:text-accent transition-colors"
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
          <Label htmlFor="linkedin" className="text-foreground/80">LinkedIn Profile URL</Label>
          <Input
            id="linkedin"
            placeholder="https://linkedin.com/in/yourprofile"
            value={telegramHandle}
            onChange={(e) => setTelegramHandle(e.target.value)}
            className="bg-secondary border-border focus:border-primary focus:ring-primary/20"
          />
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