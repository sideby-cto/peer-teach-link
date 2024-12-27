import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { TranscriptDropzone } from "./TranscriptDropzone";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [selectedPosts, setSelectedPosts] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const handlePostSuggestions = async (suggestions: PostSuggestion[]) => {
    setPendingPosts(suggestions);
    setSelectedPosts(new Set()); // Reset selections when new suggestions arrive
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

      // Only insert selected posts
      const selectedPostsArray = Array.from(selectedPosts);
      const postsToInsert = selectedPostsArray.map(index => ({
        content: pendingPosts[index].content,
        post_type: pendingPosts[index].post_type,
        teacher_id: user.id,
        is_ai_generated: true,
        is_approved: false
      }));

      if (postsToInsert.length === 0) {
        toast({
          title: "No posts selected",
          description: "Please select at least one post to share.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('posts')
        .insert(postsToInsert);

      if (error) throw error;

      toast({
        title: "Posts created",
        description: `${postsToInsert.length} post(s) have been shared and will be visible once approved.`,
      });
      
      setPendingPosts(null);
    } catch (error) {
      console.error('Error creating posts:', error);
      toast({
        title: "Error",
        description: "Failed to create posts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPosts = () => {
    setPendingPosts(null);
    setSelectedPosts(new Set());
  };

  const togglePostSelection = (index: number) => {
    const newSelection = new Set(selectedPosts);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setSelectedPosts(newSelection);
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
            <AlertDialogTitle>Select posts to share</AlertDialogTitle>
            <AlertDialogDescription className="space-y-4">
              <p>Select which insights you'd like to share:</p>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Short Posts</h4>
                  {pendingPosts?.map((post, i) => 
                    post.post_type === 'short' && (
                      <div key={i} className="flex items-start space-x-3 mb-2">
                        <Checkbox
                          id={`post-${i}`}
                          checked={selectedPosts.has(i)}
                          onCheckedChange={() => togglePostSelection(i)}
                          className="mt-1"
                        />
                        <label
                          htmlFor={`post-${i}`}
                          className="text-sm leading-relaxed cursor-pointer bg-muted p-4 rounded-md flex-1 whitespace-pre-wrap"
                        >
                          {post.content}
                        </label>
                      </div>
                    )
                  )}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Articles</h4>
                  {pendingPosts?.map((post, i) => 
                    post.post_type === 'article' && (
                      <div key={i} className="flex items-start space-x-3 mb-2">
                        <Checkbox
                          id={`post-${i}`}
                          checked={selectedPosts.has(i)}
                          onCheckedChange={() => togglePostSelection(i)}
                          className="mt-1"
                        />
                        <label
                          htmlFor={`post-${i}`}
                          className="text-sm leading-relaxed cursor-pointer bg-muted p-4 rounded-md flex-1 whitespace-pre-wrap"
                        >
                          {post.content}
                        </label>
                      </div>
                    )
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelPosts}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmPosts} 
              disabled={isProcessing || selectedPosts.size === 0}
            >
              {isProcessing ? "Posting..." : `Post ${selectedPosts.size} selected`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}