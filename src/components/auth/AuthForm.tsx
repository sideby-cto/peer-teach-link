import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useAuthSession } from "@/hooks/useAuthSession";

interface AuthFormProps {
  onSuccess: (userId: string) => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const { waitForSession } = useAuthSession();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) {
          // Handle rate limit error specifically
          if (error.message.includes("rate_limit")) {
            toast({
              title: "Please wait",
              description: "For security purposes, please wait a few seconds before trying again.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }
        
        const session = await waitForSession();
        onSuccess(session.user.id);
        toast({
          title: "Account created",
          description: "Please complete your teacher profile",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // Check if this is an email confirmation error
          if (error.message.includes("Email not confirmed")) {
            toast({
              title: "Email not confirmed",
              description: "Please check your email and click the confirmation link before signing in.",
              variant: "destructive",
            });
            return;
          }
          
          // Handle rate limit error for login attempts
          if (error.message.includes("rate_limit")) {
            toast({
              title: "Please wait",
              description: "For security purposes, please wait a few seconds before trying again.",
              variant: "destructive",
            });
            return;
          }
          throw error;
        }
        
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in",
        });
        const session = await waitForSession();
        onSuccess(session.user.id);
      }
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

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Loading..." : isSignUp ? "Create account" : "Sign in"}
      </Button>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Need an account? Sign up"}
      </Button>
      {isSignUp && (
        <p className="text-sm text-muted-foreground mt-2">
          After signing up, you'll need to confirm your email address before signing in.
        </p>
      )}
    </form>
  );
}