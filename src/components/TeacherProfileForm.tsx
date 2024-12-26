import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { TranscriptDropzone } from "./TranscriptDropzone";
import { FormFields } from "./profile/FormFields";
import { SuggestionAlert } from "./profile/SuggestionAlert";

interface TeacherProfileFormProps {
  onComplete: () => void;
  userId: string;
}

export function TeacherProfileForm({ onComplete, userId }: TeacherProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: "",
    title: "",
    school: "",
    experienceYears: "",
    subjects: "",
    bio: "",
  });
  const [suggestion, setSuggestion] = useState<null | {
    fullName?: string;
    title?: string;
    school?: string;
    experienceYears?: string;
    subjects?: string;
    bio?: string;
  }>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First check if we have a valid session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        throw new Error("Authentication error: " + sessionError.message);
      }
      
      if (!sessionData.session) {
        throw new Error("No active session found. Please sign in again.");
      }

      // Get the user's email from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error("Failed to get user details: " + userError.message);
      }
      
      if (!user?.email) {
        throw new Error("User email not found in session");
      }

      // Create the teacher profile
      const { error: insertError } = await supabase.from("teachers").insert([
        {
          id: userId,
          email: user.email,
          full_name: formData.fullName,
          title: formData.title,
          school: formData.school,
          experience_years: parseInt(formData.experienceYears),
          subjects: formData.subjects.split(",").map((s) => s.trim()),
          bio: formData.bio,
        },
      ]);

      if (insertError) {
        throw new Error("Failed to create profile: " + insertError.message);
      }

      toast({
        title: "Profile created",
        description: "Welcome to sideby!",
      });
      
      onComplete();
    } catch (error) {
      console.error("Profile creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSuggestion = (newSuggestion: typeof suggestion) => {
    setSuggestion(newSuggestion);
  };

  const applySuggestion = () => {
    if (!suggestion) return;
    
    setFormData(prev => ({
      ...prev,
      ...suggestion
    }));
    
    setSuggestion(null);
    
    toast({
      title: "Suggestions applied",
      description: "Profile updated with transcript insights",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TranscriptDropzone onProfileSuggestion={handleSuggestion} />
      
      <SuggestionAlert 
        suggestion={suggestion} 
        onApply={applySuggestion} 
      />

      <FormFields 
        formData={formData}
        handleChange={handleChange}
      />

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Profile..." : "Complete Profile"}
      </Button>
    </form>
  );
}