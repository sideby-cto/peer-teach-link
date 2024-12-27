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

interface PostSuggestion {
  content: string;
  post_type: 'short' | 'article';
}

export function CreatePostForm() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingPosts, setPendingPosts] = useState<PostSuggestion[] | null>(null);
  const { toast } = useToast();

  const handlePostSuggestions = async (suggestions: PostSuggestion[]) => {
    setPendingPosts(suggestions);
  };

  const handleConfirmPosts = async () => {
    if (!pendingPosts) return;
    
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

      // Insert all posts
      const { error } = await supabase
        .from('posts')
        .insert(pendingPosts.map(post => ({ 
          content: post.content,
          post_type: post.post_type,
          teacher_id: user.id,
          is_ai_generated: true,
          is_approved: false
        })));

      if (error) throw error;

      toast({
        title: "Posts created",
        description: "Your conversations have been analyzed and shared as posts. They will be visible once approved.",
      });
    } catch (error) {
      console.error('Error creating posts:', error);
      toast({
        title: "Error",
        description: "Failed to create posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setPendingPosts(null);
    }
  };

  const handleCancelPosts = () => {
    setPendingPosts(null);
  };

  return (
    <>
      <Card className="w-full max-w-2xl mb-6">
        <CardHeader>
          <h3 className="text-lg font-semibold">Share insights from your teaching conversations</h3>
          <p className="text-sm text-gray-500">Drop your conversation transcript to generate posts</p>
        </CardHeader>
        <CardContent>
          <TranscriptDropzone 
            onProfileSuggestion={() => {}} 
            onPostSuggestion={handlePostSuggestions}
            isProcessing={isProcessing}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!pendingPosts} onOpenChange={() => setPendingPosts(null)}>
        <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <AlertDialogHeader>
            <AlertDialogTitle>Review your posts</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>We've generated the following posts from your transcript:</p>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Short Posts</h4>
                  {pendingPosts?.filter(p => p.post_type === 'short').map((post, i) => (
                    <div key={i} className="bg-muted p-4 rounded-md mb-2 whitespace-pre-wrap">
                      {post.content}
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Articles</h4>
                  {pendingPosts?.filter(p => p.post_type === 'article').map((post, i) => (
                    <div key={i} className="bg-muted p-4 rounded-md mb-2 whitespace-pre-wrap">
                      {post.content}
                    </div>
                  ))}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPosts}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPosts} disabled={isProcessing}>
              {isProcessing ? "Posting..." : "Post some"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}