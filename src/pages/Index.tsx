import { Navigation } from "@/components/Navigation";
import { ProfileCard } from "@/components/ProfileCard";
import { PostCard } from "@/components/PostCard";
import { Card } from "@/components/ui/card";

const Index = () => {
  const sampleProfile = {
    name: "Sarah Johnson",
    title: "High School Mathematics Teacher",
    school: "Lincoln High School",
    experience: "10+ years in education",
    imageUrl: "/placeholder.svg",
  };

  const samplePost = {
    author: {
      name: "Michael Chen",
      title: "Science Department Head",
      imageUrl: "/placeholder.svg",
    },
    content: "Just finished an amazing professional development session on integrating project-based learning in STEM subjects. Here are my key takeaways: 1) Start small and build up, 2) Connect projects to real-world problems, 3) Encourage student collaboration. What strategies have worked in your classrooms?",
    timestamp: "2 hours ago",
    likes: 45,
    comments: 12,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="md:col-span-3">
            <ProfileCard {...sampleProfile} />
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-6 space-y-6">
            <PostCard {...samplePost} />
          </div>
          
          {/* Right Sidebar */}
          <div className="md:col-span-3">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Suggested Connections</h3>
              <div className="space-y-4">
                {/* Add suggested connections here */}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;