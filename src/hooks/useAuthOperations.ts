import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { handleAuthError } from "@/utils/authErrors";
import { useAuthSession } from "./useAuthSession";

export function useAuthOperations(onSuccess: (userId: string) => void) {
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
        if (!handleAuthError(error, toast)) {
          throw error;
        }
      }
      
      toast({
        title: "Account created - Confirmation required",
        description: "Please check your email and click the confirmation link before signing in. This may take a few minutes.",
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
        if (!handleAuthError(error, toast)) {
          throw error;
        }
      }
      
      const session = await waitForSession();
      onSuccess(session.user.id);
      toast({
        title: "Welcome back!",
        description: "You've successfully signed in",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
}