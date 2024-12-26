import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PostCardProps {
  author: {
    name: string;
    title: string;
    imageUrl: string;
  };
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  isApproved: boolean;
}

export const PostCard = ({ author, content, timestamp, likes, comments, isApproved }: PostCardProps) => {
  return (
    <Card className="w-full max-w-2xl animate-fadeIn">
      <CardHeader className="flex flex-row items-center gap-4">
        <img
          src={author.imageUrl}
          alt={author.name}
          className="w-12 h-12 rounded-full object-cover"
        />
        <div className="flex-1">
          <h3 className="font-semibold">{author.name}</h3>
          <p className="text-sm text-gray-500">{author.title}</p>
          <p className="text-xs text-gray-400">{timestamp}</p>
        </div>
        {isApproved && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span className="text-xs">Mike has approved this post</span>
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <p className="text-gray-700">{content}</p>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="ghost" className="flex items-center gap-2">
          <ThumbsUp className="h-4 w-4" />
          <span>{likes}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          <span>{comments}</span>
        </Button>
        <Button variant="ghost" className="flex items-center gap-2">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
};