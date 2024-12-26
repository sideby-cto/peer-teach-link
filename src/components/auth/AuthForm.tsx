import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AuthFormFields } from "./AuthFormFields";
import { useAuthOperations } from "@/hooks/useAuthOperations";

interface AuthFormProps {
  onSuccess: (userId: string) => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const { signUp, signIn, isLoading } = useAuthOperations(onSuccess);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSignUp) {
      await signUp(email, password);
    } else {
      await signIn(email, password);
    }
  };

  return (
    <form onSubmit={handleAuth} className="space-y-4">
      <AuthFormFields
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
      />
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