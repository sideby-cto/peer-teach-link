import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { FollowButton } from "./profile/FollowButton";
import { ConnectButton } from "./profile/ConnectButton";

interface ProfileCardProps {
  name: string;
  title: string;
  school: string;
  experience: string;
  imageUrl: string;
  teacherId: string;
  stance?: string;
}

export const ProfileCard = ({ name, title, school, experience, imageUrl, teacherId, stance }: ProfileCardProps) => {
  const [isInitiallyFollowing, setIsInitiallyFollowing] = useState(false);

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
          .maybeSingle();

        setIsInitiallyFollowing(!!followers);
      } catch (error) {
        console.error('Error checking follow status:', error);
      }
    };

    checkFollowStatus();
  }, [teacherId]);

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
          {stance && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg">
              <h4 className="text-sm font-semibold mb-2">Teaching Philosophy</h4>
              <p className="text-sm text-gray-700 italic">{stance}</p>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            <FollowButton 
              teacherId={teacherId}
              teacherName={name}
              isInitiallyFollowing={isInitiallyFollowing}
            />
            <ConnectButton 
              teacherId={teacherId}
              teacherName={name}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};