import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { TranscriptDropzone } from "./TranscriptDropzone";

export function CreatePostForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePostSuggestion = async (suggestion: { content: string }) => {
    setIsProcessing(true);
    try {
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create posts.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from("posts")
        .insert([{ 
          content: suggestion.content, 
          teacher_id: user.id,
          is_ai_generated: true 
        }]);

      if (error) throw error;

      toast({
        title: "Post created",
        description: "Your conversation has been analyzed and shared as a post.",
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mb-6">
      <CardHeader>
        <h3 className="text-lg font-semibold">Share insights from your teaching conversations</h3>
        <p className="text-sm text-gray-500">Drop your conversation transcript to generate a post</p>
      </CardHeader>
      <CardContent>
        <TranscriptDropzone 
          onProfileSuggestion={() => {}} 
          onPostSuggestion={handlePostSuggestion}
          isProcessing={isProcessing}
        />
      </CardContent>
    </Card>
  );
}