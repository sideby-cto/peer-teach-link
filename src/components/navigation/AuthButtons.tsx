import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";

interface AuthButtonsProps {
  loading: boolean;
  user: User | null;
  setIsAuthModalOpen: (isOpen: boolean) => void;
}

export const AuthButtons = ({ loading, user, setIsAuthModalOpen }: AuthButtonsProps) => {
  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-primary-foreground/10 animate-pulse" />;
  }

  if (!user) {
    return (
      <Button 
        variant="secondary"
        onClick={() => setIsAuthModalOpen(true)}
        className="font-semibold"
      >
        Get Started
      </Button>
    );
  }

  return null;
};