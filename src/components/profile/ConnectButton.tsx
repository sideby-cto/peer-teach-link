import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { addDays, setHours, setMinutes } from "date-fns";

interface ConnectButtonProps {
  teacherId: string;
  teacherName: string;
}

export const ConnectButton = ({ teacherId, teacherName }: ConnectButtonProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [isScheduling, setIsScheduling] = useState(false);

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

      setIsOpen(true);
    } catch (error) {
      console.error('Error connecting:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSchedule = async () => {
    if (!selectedDate) {
      toast({
        title: "Select a date",
        description: "Please select a date and time for the meeting",
        variant: "destructive",
      });
      return;
    }

    setIsScheduling(true);

    try {
      const response = await fetch('/functions/v1/create-calendar-event', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teacherId,
          teacherName,
          selectedTime: selectedDate.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to schedule meeting');
      }

      const { meetingLink } = await response.json();

      toast({
        title: "Meeting scheduled!",
        description: `Your meeting with ${teacherName} has been scheduled. Check your email for the calendar invite.`,
      });

      setIsOpen(false);
    } catch (error) {
      console.error('Error scheduling meeting:', error);
      toast({
        title: "Scheduling failed",
        description: "Failed to schedule the meeting. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsScheduling(false);
    }
  };

  return (
    <>
      <Button 
        variant="secondary"
        onClick={handleConnect}
        className="flex-1"
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        20min Chat
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Schedule a 20-minute chat with {teacherName}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <CalendarComponent
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => 
                date < new Date() || 
                date > addDays(new Date(), 30)
              }
              className="rounded-md border"
            />
          </div>

          <Button 
            onClick={handleSchedule} 
            disabled={!selectedDate || isScheduling}
            className="w-full"
          >
            <Calendar className="mr-2 h-4 w-4" />
            {isScheduling ? "Scheduling..." : "Schedule Meeting"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};