import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSessionContext } from '@supabase/auth-helpers-react';

export const useSessionManager = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, isLoading: sessionLoading, error: sessionError } = useSessionContext();

  // Handle session errors
  useEffect(() => {
    if (sessionError) {
      console.error('Session error:', sessionError);
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token');
      toast({
        title: "Authentication Error",
        description: "There was a problem with your session. Please sign in again.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [sessionError, toast, navigate]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        // Clear any stored session data
        localStorage.removeItem('supabase.auth.token');
        toast({
          title: "Session ended",
          description: "Please sign in to continue.",
          variant: "destructive",
        });
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return {
    session,
    isLoading: sessionLoading,
  };
};