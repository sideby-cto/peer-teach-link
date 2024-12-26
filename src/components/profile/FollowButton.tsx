import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface FollowButtonProps {
  teacherId: string;
  teacherName: string;
  isInitiallyFollowing: boolean;
}

export const FollowButton = ({ teacherId, teacherName, isInitiallyFollowing }: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(isInitiallyFollowing);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

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

      // First, verify that the teacher exists in the teachers table
      const { data: teacherProfile } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', teacherId)
        .maybeSingle();

      if (!teacherProfile) {
        toast({
          title: "Error",
          description: "This teacher hasn't completed their profile yet",
          variant: "destructive",
        });
        return;
      }

      // Check if the current user has a teacher profile
      const { data: currentTeacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!currentTeacher) {
        toast({
          title: "Profile required",
          description: "Please complete your teacher profile first",
          variant: "destructive",
        });
        return;
      }

      if (isFollowing) {
        const { error } = await supabase
          .from('followers')
          .delete()
          .match({ follower_id: user.id, following_id: teacherId });

        if (error) throw error;
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${teacherName}`,
        });
      } else {
        const { error } = await supabase
          .from('followers')
          .insert([
            { follower_id: user.id, following_id: teacherId }
          ]);

        if (error) throw error;
        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You are now following ${teacherName}`,
        });
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

  return (
    <Button 
      variant={isFollowing ? "outline" : "default"}
      onClick={handleFollow}
      disabled={isLoading}
      className="flex-1"
    >
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};