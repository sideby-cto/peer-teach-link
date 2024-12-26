import { Navigation } from "@/components/Navigation";
import { ProfileCard } from "@/components/ProfileCard";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { HomeIcon } from "lucide-react";

interface ProfileLayoutProps {
  profile: {
    full_name: string;
    title: string;
    school: string;
    experience_years: number;
    avatar_url: string;
    id: string;
    stance: string;
  };
}

export const ProfileLayout = ({ profile }: ProfileLayoutProps) => {
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
                <BreadcrumbLink>Profile</BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          <ProfileCard
            name={profile.full_name}
            title={profile.title}
            school={profile.school}
            experience={`${profile.experience_years} years in education`}
            imageUrl={profile.avatar_url || "/placeholder.svg"}
            teacherId={profile.id}
            stance={profile.stance}
          />
        </div>
      </main>
    </div>
  );
};