import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { TranscriptDropzone } from "./TranscriptDropzone";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function CreatePostForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingPost, setPendingPost] = useState<{ content: string } | null>(null);
  const { toast } = useToast();

  const handlePostSuggestion = async (suggestion: { content: string }) => {
    setPendingPost(suggestion);
  };

  const handleConfirmPost = async () => {
    if (!pendingPost) return;
    
    setIsProcessing(true);
    try {
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
          content: pendingPost.content, 
          teacher_id: user.id,
          is_ai_generated: true,
          is_approved: false // Posts start as unapproved
        }]);

      if (error) throw error;

      toast({
        title: "Post created",
        description: "Your conversation has been analyzed and shared as a post. It will be visible once approved.",
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
      setPendingPost(null);
    }
  };

  const handleCancelPost = () => {
    setPendingPost(null);
  };

  return (
    <>
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

      <AlertDialog open={!!pendingPost} onOpenChange={() => setPendingPost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review your post</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Here's what we generated from your transcript. Would you like to post it?</p>
              <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                {pendingPost?.content}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPost}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPost} disabled={isProcessing}>
              {isProcessing ? "Posting..." : "Post"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}