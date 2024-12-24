import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { TranscriptDropzone } from "./TranscriptDropzone";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function TeacherProfileForm({
  onComplete,
  userId,
}: {
  onComplete: () => void;
  userId: string;
}) {
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
      
      {suggestion && (
        <Alert>
          <AlertDescription className="space-y-2">
            <p className="font-medium">We found some suggestions from your transcript:</p>
            <ul className="text-sm space-y-1">
              {Object.entries(suggestion).map(([key, value]) => (
                <li key={key}>• {key}: {value}</li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={applySuggestion}
              className="mt-2"
            >
              Apply Suggestions
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Math Teacher, Science Department Head"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="school">School</Label>
        <Input
          id="school"
          name="school"
          value={formData.school}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experienceYears">Years of Experience</Label>
        <Input
          id="experienceYears"
          name="experienceYears"
          type="number"
          min="0"
          value={formData.experienceYears}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subjects">Subjects (comma-separated)</Label>
        <Input
          id="subjects"
          name="subjects"
          placeholder="e.g. Mathematics, Physics, Computer Science"
          value={formData.subjects}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell us about yourself and your teaching philosophy"
          value={formData.bio}
          onChange={handleChange}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating Profile..." : "Complete Profile"}
      </Button>
    </form>
  );
}