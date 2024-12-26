import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { PostCard } from "@/components/PostCard";
import { CreatePostForm } from "@/components/CreatePostForm";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: postsData, error } = await supabase
          .from('posts')
          .select(`
            *,
            teachers:teacher_id (
              full_name,
              title,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        setPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error",
          description: "Failed to load posts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
        <Navigation />
        <main className="pt-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-32">
              <div className="animate-pulse text-primary">Loading...</div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      <Navigation />
      <main className="pt-20 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <CreatePostForm />
          
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                author={{
                  name: post.teachers?.full_name || 'Unknown Teacher',
                  title: post.teachers?.title || 'Teacher',
                  imageUrl: post.teachers?.avatar_url || '/placeholder.svg'
                }}
                content={post.content}
                timestamp={new Date(post.created_at).toLocaleDateString()}
                likes={post.likes_count || 0}
                comments={0}
                isApproved={post.is_approved}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;