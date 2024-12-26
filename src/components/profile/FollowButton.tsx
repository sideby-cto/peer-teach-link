import { Button } from "@/components/ui/button";
import { useFollowTeacher } from "./useFollowTeacher";

interface FollowButtonProps {
  teacherId: string;
  teacherName: string;
  isInitiallyFollowing: boolean;
}

export const FollowButton = ({ 
  teacherId, 
  teacherName, 
  isInitiallyFollowing 
}: FollowButtonProps) => {
  const { isFollowing, isLoading, handleFollow } = useFollowTeacher({
    teacherId,
    teacherName,
    isInitiallyFollowing
  });

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