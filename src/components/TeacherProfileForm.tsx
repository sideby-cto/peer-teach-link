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
      const { error } = await supabase.from("teachers").insert([
        {
          id: userId,
          full_name: formData.fullName,
          title: formData.title,
          school: formData.school,
          experience_years: parseInt(formData.experienceYears),
          subjects: formData.subjects.split(",").map((s) => s.trim()),
          bio: formData.bio,
        },
      ]);

      if (error) throw error;

      toast({
        title: "Profile created",
        description: "Welcome to TeachConnect!",
      });
      
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
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