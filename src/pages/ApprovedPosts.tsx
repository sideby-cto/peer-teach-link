import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { PostCard } from "@/components/PostCard";
import { supabase } from "@/lib/supabase";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ApprovedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchApprovedPosts = async () => {
      try {
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
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching approved posts:', error);
        toast({
          title: "Error",
          description: "Failed to load approved posts",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedPosts();
  }, [toast]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-2">
                  <HomeIcon className="h-4 w-4" />
                  Timeline
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink>Approved Posts</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <h1 className="text-2xl font-bold mb-6">Approved Posts</h1>

          {loading ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">No approved posts yet.</p>
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
                  likes={post.likes_count}
                  comments={0}
                  isApproved={true}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApprovedPosts;