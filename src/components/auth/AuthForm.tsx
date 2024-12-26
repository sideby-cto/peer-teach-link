import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthFormFields } from "./AuthFormFields";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getAuthErrorMessage } from "@/utils/authErrors";
import { Button } from "@/components/ui/button";

interface AuthFormProps {
  onSuccess: (userId: string) => Promise<void>;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      let result;
      
      if (mode === "signup") {
        result = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      }

      if (result.error) {
        toast({
          title: "Authentication Error",
          description: getAuthErrorMessage(result.error.message),
          variant: "destructive",
        });
        return;
      }

      if (mode === "signup" && result.data?.user) {
        toast({
          title: "Account created",
          description: "Please check your email to confirm your account before signing in.",
        });
        setMode("signin");
      } else if (mode === "signin" && result.data?.user) {
        await onSuccess(result.data.user.id);
        navigate("/");
      }
    } catch (error) {
      console.error("Auth error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "signin" ? "Welcome back" : "Create an account"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {mode === "signin"
            ? "Enter your credentials to sign in"
            : "Enter your email below to create your account"}
        </p>
      </div>

      <AuthFormFields
        mode={mode}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />

      <div className="text-center">
        <Button
          variant="link"
          className="text-sm text-muted-foreground"
          onClick={toggleMode}
        >
          {mode === "signin"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
        </Button>
      </div>
    </div>
  );
}