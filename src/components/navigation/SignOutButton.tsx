import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSessionManager } from "@/hooks/useSessionManager";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

export const SignOutButton = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearSessionData } = useSessionManager();
  
  const handleSignOut = async () => {
    try {
      clearSessionData();
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      
      window.location.href = '/';
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenuItem onClick={handleSignOut}>
      Sign Out
    </DropdownMenuItem>
  );
};