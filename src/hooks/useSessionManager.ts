import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { useSessionContext } from '@supabase/auth-helpers-react';

const STORAGE_KEYS = {
  AUTH_TOKEN: 'supabase.auth.token',
  PROJECT_TOKEN: 'sb-avphywyhlxajyhqudkts-auth-token'
} as const;

export const useSessionManager = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { 
    session, 
    isLoading: sessionLoading, 
    error: sessionError 
  } = useSessionContext();

  const clearSessionData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  };

  useEffect(() => {
    if (sessionError) {
      console.error('Session error:', sessionError);
      clearSessionData();
      toast({
        title: "Session Error",
        description: "Your session has expired. Please sign in again.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [sessionError, toast, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!currentSession) {
        clearSessionData();
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
    clearSessionData,
  };
};