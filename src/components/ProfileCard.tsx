import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

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
          <Button 
            className="w-full mt-4"
            variant={isFollowing ? "outline" : "default"}
            onClick={handleFollow}
            disabled={isLoading}
          >
            {isFollowing ? "Following" : "Follow"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};