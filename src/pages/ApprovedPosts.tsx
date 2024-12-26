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
import { Button } from "@/components/ui/button";

const ApprovedPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      // First try to get unapproved posts (for admins)
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

      // Then get approved posts (visible to everyone)
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
      
      // Combine both sets of posts
      const allPosts = [
        ...(unapprovedData || []).map(post => ({ ...post, isAdmin: true })),
        ...(approvedData || [])
      ];
      
      setPosts(allPosts);
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

  useEffect(() => {
    fetchPosts();
  }, [toast]);

  const handleApprove = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ is_approved: true })
        .eq('id', postId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Post approved successfully",
      });

      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error approving post:', error);
      toast({
        title: "Error",
        description: "Failed to approve post. You might not have permission.",
        variant: "destructive",
      });
    }
  };

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
                <BreadcrumbLink>Posts</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Posts</h1>
          </div>

          {loading ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">No posts yet.</p>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div key={post.id} className="space-y-2">
                  <PostCard
                    author={{
                      name: post.teachers?.full_name || 'Unknown Teacher',
                      title: post.teachers?.title || 'Teacher',
                      imageUrl: post.teachers?.avatar_url || '/placeholder.svg'
                    }}
                    content={post.content}
                    timestamp={new Date(post.created_at).toLocaleDateString()}
                    likes={post.likes_count}
                    comments={0}
                    isApproved={post.is_approved}
                  />
                  {post.isAdmin && !post.is_approved && (
                    <div className="flex justify-end">
                      <Button 
                        onClick={() => handleApprove(post.id)}
                        variant="outline"
                        className="text-sm"
                      >
                        Approve Post
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ApprovedPosts;