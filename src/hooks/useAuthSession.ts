import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export function useAuthSession() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session) {
      toast({
        title: "Session Error",
        description: "Please sign in again to complete your profile",
        variant: "destructive",
      });
      return false;
    }
    return session;
  };

  const waitForSession = async () => {
    setIsLoading(true);
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        throw new Error("Failed to establish session. Please try signing in.");
      }
      return session;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    checkSession,
    waitForSession,
    isLoading,
  };
}