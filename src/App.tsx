import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import ApprovedPosts from "./pages/ApprovedPosts";
import Discover from "./pages/Discover";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSessionContext } from '@supabase/auth-helpers-react';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { session, isLoading: sessionLoading, error: sessionError } = useSessionContext();

  useEffect(() => {
    if (sessionError) {
      console.error('Session error:', sessionError);
      toast({
        title: "Authentication Error",
        description: "There was a problem with your session. Please sign in again.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [sessionError, toast, navigate]);

  // Wait for session loading
  useEffect(() => {
    if (!sessionLoading) {
      setLoading(false);
    }
  }, [sessionLoading]);

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
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

  if (loading || sessionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route 
          path="/profile" 
          element={
            session ? <Profile /> : <Index />
          } 
        />
        <Route 
          path="/approved-posts" 
          element={
            session ? <ApprovedPosts /> : <Index />
          } 
        />
        <Route 
          path="/discover" 
          element={
            session ? <Discover /> : <Index />
          } 
        />
      </Routes>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;