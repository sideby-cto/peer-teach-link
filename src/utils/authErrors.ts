export const getAuthErrorMessage = (error: string): string => {
  if (error.includes("Invalid login credentials")) {
    return "Invalid email or password. Please try again.";
  }
  if (error.includes("Email not confirmed")) {
    return "Please check your email and confirm your account before signing in.";
  }
  if (error.includes("rate limit")) {
    return "Too many attempts. Please wait a moment before trying again.";
  }
  return "An unexpected error occurred. Please try again.";
};

export const handleAuthError = (error: Error, toast: any) => {
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
      title: "Email confirmation required",
      description: "Please check your email and click the confirmation link. After confirming, you can sign in.",
      variant: "destructive",
      duration: 6000,
    });
    return true;
  }
  
  return false;
};