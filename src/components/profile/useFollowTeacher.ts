import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface UseFollowTeacherProps {
  teacherId: string;
  teacherName: string;
  isInitiallyFollowing: boolean;
}

export const useFollowTeacher = ({ 
  teacherId, 
  teacherName, 
  isInitiallyFollowing 
}: UseFollowTeacherProps) => {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const checkTeacherProfile = async (userId: string) => {
    const { data: teacherProfile } = await supabase
      .from('teachers')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
    return teacherProfile;
  };

  const handleFollow = async () => {
    try {
      setIsLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to follow teachers",
          variant: "destructive",
        });
        return;
      }

      const targetTeacher = await checkTeacherProfile(teacherId);
      if (!targetTeacher) {
        toast({
          title: "Error",
          description: "This teacher hasn't completed their profile yet",
          variant: "destructive",
        });
        return;
      }

      const currentTeacher = await checkTeacherProfile(user.id);
      if (!currentTeacher) {
        toast({
          title: "Profile required",
          description: "Please complete your teacher profile first",
          variant: "destructive",
        });
        return;
      }

      if (isFollowing) {
        await handleUnfollow(user.id);
      } else {
        await handleNewFollow(user.id);
      }
    } catch (error) {
      console.error('Error managing follow:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async (userId: string) => {
    const { error } = await supabase
      .from('followers')
      .delete()
      .match({ follower_id: userId, following_id: teacherId });

    if (error) throw error;
    setIsFollowing(false);
    toast({
      title: "Unfollowed",
      description: `You are no longer following ${teacherName}`,
    });
  };

  const handleNewFollow = async (userId: string) => {
    const { data: existingFollow } = await supabase
      .from('followers')
      .select('id')
      .match({ follower_id: userId, following_id: teacherId })
      .maybeSingle();

    if (existingFollow) {
      setIsFollowing(true);
      toast({
        title: "Already following",
        description: `You are already following ${teacherName}`,
      });
      return;
    }

    const { error } = await supabase
      .from('followers')
      .insert([
        { follower_id: userId, following_id: teacherId }
      ]);

    if (error?.code === '23505') {
      setIsFollowing(true);
      toast({
        title: "Already following",
        description: `You are already following ${teacherName}`,
      });
      return;
    }

    if (error) throw error;
    
    setIsFollowing(true);
    toast({
      title: "Following",
      description: `You are now following ${teacherName}`,
    });
  };

  return {
    isFollowing,
    isLoading,
    handleFollow
  };
};