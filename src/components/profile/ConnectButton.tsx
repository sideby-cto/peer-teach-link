import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface ConnectButtonProps {
  teacherId: string;
  teacherName: string;
}

export const ConnectButton = ({ teacherId, teacherName }: ConnectButtonProps) => {
  const { toast } = useToast();

  const handleConnect = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to connect with teachers",
          variant: "destructive",
        });
        return;
      }

      // Check if the target teacher exists
      const { data: targetTeacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', teacherId)
        .maybeSingle();

      if (!targetTeacher) {
        toast({
          title: "Error",
          description: "This teacher hasn't completed their profile yet",
          variant: "destructive",
        });
        return;
      }

      // Check if the current user has a teacher profile
      const { data: currentTeacher } = await supabase
        .from('teachers')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!currentTeacher) {
        toast({
          title: "Profile required",
          description: "Please complete your teacher profile first",
          variant: "destructive",
        });
        return;
      }

      // Now we can safely create the conversation
      const { error } = await supabase
        .from('conversations')
        .insert([
          { 
            teacher1_id: user.id, 
            teacher2_id: teacherId,
            status: 'scheduled'
          }
        ]);

      if (error) throw error;

      toast({
        title: "Connection requested",
        description: `We'll notify you when ${teacherName} accepts your 20-minute conversation request`,
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
    <Button 
      variant="secondary"
      onClick={handleConnect}
      className="flex-1"
    >
      <MessageSquare className="mr-2 h-4 w-4" />
      20min Chat
    </Button>
  );
};