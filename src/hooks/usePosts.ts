import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const usePosts = () => {
  return useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          // If not logged in, only fetch approved posts
          const { data, error } = await supabase
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

          if (error) throw error;
          return data || [];
        }

        // If logged in, fetch both approved posts and user's own unapproved posts
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            teachers:teacher_id (
              full_name,
              title,
              avatar_url
            )
          `)
          .or(`is_approved.eq.true,and(teacher_id.eq.${user.id},is_approved.eq.false)`)
          .order('created_at', { ascending: false });

        if (error) throw error;
        console.log('Fetched posts:', data);
        return data || [];
      } catch (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }
    }
  });
};