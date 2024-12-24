import { Bell, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotificationButtons = () => {
  return (
    <>
      <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
        <Bell className="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" className="text-white hover:bg-primary/80">
        <MessageCircle className="h-5 w-5" />
      </Button>
    </>
  );
};