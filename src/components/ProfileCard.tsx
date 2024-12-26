import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { MessageSquare } from "lucide-react";

interface ProfileCardProps {
  name: string;
  title: string;
  school: string;
  experience: string;
  imageUrl: string;
  teacherId: string;
}

export const ProfileCard = ({ name, title, school, experience, imageUrl, teacherId }: ProfileCardProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Check if the current user is following this teacher
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: followers } = await supabase
          .from('followers')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', teacherId)
          .single();

        setIsFollowing(!!followers);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [teacherId]);

  const handleFollow = async () => {
    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to follow teachers",
          variant: "destructive",
        });
        return;
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('followers')
          .delete()
          .match({ follower_id: user.id, following_id: teacherId });

        if (error) throw error;
        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: `You are no longer following ${name}`,
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('followers')
          .insert([
            { follower_id: user.id, following_id: teacherId }
          ]);

        if (error) throw error;
        setIsFollowing(true);
        toast({
          title: "Following",
          description: `You are now following ${name}`,
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

  const handleConnect = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect with teachers",
          variant: "destructive",
        });
        return;
      }

      // Create a new conversation request
      const { error } = await supabase
        .from('conversations')
        .insert([
          { 
            teacher1_id: user.id, 
            teacher2_id: teacherId,
            status: 'scheduled'
          }
        ]);

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }

      toast({
        title: "Connection requested",
        description: `We'll notify you when ${name} accepts your 20-minute conversation request`,
      });
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md animate-fadeIn">
      <CardHeader className="flex flex-row items-center gap-4">
        <img
          src={imageUrl}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-semibold">School:</span> {school}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Experience:</span> {experience}
          </p>
          <div className="flex gap-2 mt-4">
            <Button 
              className="flex-1"
              variant={isFollowing ? "outline" : "default"}
              onClick={handleFollow}
              disabled={isLoading}
            >
              {isFollowing ? "Following" : "Follow"}
            </Button>
            <Button 
              className="flex-1"
              variant="secondary"
              onClick={handleConnect}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              20min Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};