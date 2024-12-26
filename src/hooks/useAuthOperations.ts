import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { handleAuthError } from "@/utils/authErrors";
import { useAuthSession } from "@/hooks/useAuthSession";

export const useAuthOperations = (onSuccess: (userId: string) => void) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { waitForSession } = useAuthSession();

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        if (handleAuthError(error, toast)) return;
        throw error;
      }
      
      const session = await waitForSession();
      onSuccess(session.user.id);
      toast({
        title: "Account created",
        description: "Please complete your teacher profile",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        if (handleAuthError(error, toast)) return;
        throw error;
      }
      
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in",
      });
      const session = await waitForSession();
      onSuccess(session.user.id);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    isLoading,
  };
};