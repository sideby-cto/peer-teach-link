import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { ProfileCard } from "@/components/ProfileCard";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/');
          return;
        }

        const { data: teacherProfile, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (!teacherProfile) {
          toast({
            title: "Profile not found",
            description: "Please complete your profile first",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setProfile(teacherProfile);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="pt-20 px-4">
          <div className="max-w-7xl mx-auto">
            Loading...
          </div>
        </main>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">My Profile</h1>
          <ProfileCard
            name={profile.full_name}
            title={profile.title}
            school={profile.school}
            experience={`${profile.experience_years} years in education`}
            imageUrl={profile.avatar_url || "/placeholder.svg"}
            teacherId={profile.id}
          />
        </div>
      </main>
    </div>
  );
};

export default Profile;