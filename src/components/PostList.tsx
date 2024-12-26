import { PostCard } from "@/components/PostCard";
import { Button } from "@/components/ui/button";

interface Post {
  id: string;
  content: string;
  created_at: string;
  likes_count: number;
  is_approved: boolean;
  isAdmin?: boolean;
  teachers: {
    full_name: string;
    title: string;
    avatar_url: string;
  };
}

interface PostListProps {
  posts: Post[];
  onApprove: (postId: string) => void;
}

export const PostList = ({ posts, onApprove }: PostListProps) => {
  return (
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
                onClick={() => onApprove(post.id)}
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
  );
};