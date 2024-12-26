import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

export const useApprovedPosts = () => {
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        const { data: unapprovedData, error: unapprovedError } = await supabase
          .from('posts')
          .select(`
            *,
            teachers:teacher_id (
              full_name,
              title,
              avatar_url
            )
          `)
          .eq('is_approved', false)
          .order('created_at', { ascending: false });

        const { data: approvedData, error: approvedError } = await supabase
          .from('posts')
          .select(`
            *,
            teachers:teacher_id (
              full_name,
              title,
              avatar_url
            )
          `)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });

        if (unapprovedError && approvedError) throw unapprovedError;
        
        return [
          ...(unapprovedData || []).map(post => ({ ...post, isAdmin: true })),
          ...(approvedData || [])
        ];
      } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
    }
  });

  const approvePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase
        .from('posts')
        .update({ is_approved: true })
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Success",
        description: "Post approved successfully",
      });
    },
    onError: (error) => {
      console.error('Error approving post:', error);
      toast({
        title: "Error",
        description: "Failed to approve post. You might not have permission.",
        variant: "destructive",
      });
    }
  });

  return {
    posts,
    isLoading,
    error,
    approvePost: approvePostMutation.mutate
  };
};