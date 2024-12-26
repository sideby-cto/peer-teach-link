import { useToast } from "@/hooks/use-toast";

export const handleAuthError = (error: Error, toast: ReturnType<typeof useToast>["toast"]) => {
  if (error.message.includes("rate_limit")) {
    toast({
      title: "Please wait",
      description: "For security purposes, please wait a few seconds before trying again.",
      variant: "destructive",
    });
    return true;
  }
  
  if (error.message.includes("Email not confirmed")) {
    toast({
      title: "Email not confirmed",
      description: "Please check your email and click the confirmation link before signing in.",
      variant: "destructive",
    });
    return true;
  }
  
  return false;
};