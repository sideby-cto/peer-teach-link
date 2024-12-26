import { Navigation } from "@/components/Navigation";
import { PostList } from "@/components/PostList";
import { useApprovedPosts } from "@/hooks/useApprovedPosts";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { HomeIcon, Loader2 } from "lucide-react";

const ApprovedPosts = () => {
  const { posts, isLoading, error, approvePost } = useApprovedPosts();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
                  <HomeIcon className="h-4 w-4" />
                  Timeline
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem>
                <BreadcrumbLink className="text-gray-900 font-medium">Posts</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-5">
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">
                Approved Posts
              </h1>
              <p className="mt-2 text-lg text-gray-600 max-w-prose">
                Browse through insightful teaching conversations that have been reviewed and approved.
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center min-h-[200px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                <p className="text-red-500 font-medium">Error loading posts. Please try again later.</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <p className="text-gray-500 text-lg">No approved posts available yet.</p>
                <p className="text-gray-400 mt-2">Check back later for new content.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <PostList posts={posts} onApprove={approvePost} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApprovedPosts;