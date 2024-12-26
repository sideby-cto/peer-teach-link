import { Navigation } from "@/components/Navigation";
import { PostList } from "@/components/PostList";
import { useApprovedPosts } from "@/hooks/useApprovedPosts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";

const ApprovedPosts = () => {
  const { posts, isLoading, error, approvePost } = useApprovedPosts();

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

          {isLoading ? (
            <p>Loading posts...</p>
          ) : error ? (
            <p className="text-center text-red-500 mt-8">Error loading posts.</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-gray-500 mt-8">No posts yet.</p>
          ) : (
            <PostList posts={posts} onApprove={approvePost} />
          )}
        </div>
      </main>
    </div>
  );
};

export default ApprovedPosts;