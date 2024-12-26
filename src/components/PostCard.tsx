import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
    <Card className="w-full bg-white shadow-sm hover:shadow-md transition-shadow duration-200 animate-fadeIn" data-testid="post-card">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <img
          src={author.imageUrl}
          alt={author.name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
        />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                {author.name}
              </h3>
              <p className="text-sm font-medium text-gray-600">{author.title}</p>
            </div>
            {isApproved && (
              <Badge variant="secondary" className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100">
                <CheckCircle className="h-3 w-3" />
                <span className="text-xs font-medium">Approved</span>
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">{timestamp}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button 
          variant="ghost" 
          className={cn(
            "flex items-center gap-2 text-gray-600 hover:text-primary hover:bg-primary/10",
            "transition-colors duration-200 font-medium"
          )}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{likes}</span>
        </Button>
        <Button 
          variant="ghost" 
          className={cn(
            "flex items-center gap-2 text-gray-600 hover:text-primary hover:bg-primary/10",
            "transition-colors duration-200 font-medium"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          <span>{comments}</span>
        </Button>
        <Button 
          variant="ghost" 
          className={cn(
            "flex items-center gap-2 text-gray-600 hover:text-primary hover:bg-primary/10",
            "transition-colors duration-200 font-medium"
          )}
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </CardFooter>
    </Card>
  );
};