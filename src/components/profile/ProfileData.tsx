import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { ProfileLayout } from "./ProfileLayout";

export const ProfileData = () => {
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
    return <div>Loading...</div>;
  }

  if (!profile) return null;

  return <ProfileLayout profile={profile} />;
};