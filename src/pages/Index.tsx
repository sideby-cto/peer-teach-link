import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { PostCard } from "@/components/PostCard";
import { CreatePostForm } from "@/components/CreatePostForm";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Index = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        console.log("Fetching posts...");
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

        if (error) {
          console.error('Error fetching posts:', error);
          throw error;
        }

        console.log("Fetched posts:", postsData);
        setPosts(postsData || []);
      } catch (error) {
        console.error('Error fetching posts:', error);
        toast({
          title: "Error",
          description: "Failed to load posts. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      <Navigation />
      <main className="pt-20 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <CreatePostForm />
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No posts yet. Try creating one by dropping a transcript above!
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Note: Your posts will be visible here after creation, but will only appear in the Approved Posts section after review.
              </p>
            </div>
          ) : (
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
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;