import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

  const handleShare = async (platform?: string) => {
    const shareUrl = `${window.location.origin}/posts/${encodeURIComponent(content.substring(0, 50))}`;
    const shareText = `Check out this teaching insight from ${author.name}: "${content.substring(0, 180)}..."`;

    if (!platform && navigator.share) {
      try {
        await navigator.share({
          title: "Shared from sideby",
          text: shareText,
          url: shareUrl,
        });
        toast({
          title: "Shared successfully",
          description: "Thank you for sharing this insight!",
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          toast({
            title: "Sharing failed",
            description: "Please try another sharing method",
            variant: "destructive",
          });
        }
      }
      return;
    }

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    };

    if (platform && shareUrls[platform as keyof typeof shareUrls]) {
      window.open(shareUrls[platform as keyof typeof shareUrls], "_blank", "width=600,height=400");
      toast({
        title: "Opening share window",
        description: `Opening ${platform} to share this post`,
      });
    }
  };

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
            <div className="flex items-center gap-2">
              {isApproved && (
                <Badge variant="secondary" className="flex items-center gap-1 bg-green-50 text-green-700 hover:bg-green-100">
                  <CheckCircle className="h-3 w-3" />
                  <span className="text-xs font-medium">Approved</span>
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleShare()}>
                    Share...
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("twitter")}>
                    Share on Twitter
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("linkedin")}>
                    Share on LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleShare("facebook")}>
                    Share on Facebook
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <p className="text-xs text-gray-500">{timestamp}</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
          {content}
        </p>
      </CardContent>
    </Card>
  );
};