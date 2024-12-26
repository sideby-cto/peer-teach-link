import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import ApprovedPosts from "./pages/ApprovedPosts";
import Discover from "./pages/Discover";
import { Toaster } from "@/components/ui/toaster";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/approved-posts" element={<ApprovedPosts />} />
        <Route path="/discover" element={<Discover />} />
      </Routes>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;