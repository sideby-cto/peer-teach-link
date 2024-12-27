import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import ApprovedPosts from "./pages/ApprovedPosts";
import Discover from "./pages/Discover";
import { Toaster } from "@/components/ui/toaster";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/approved-posts" 
          element={
            <ProtectedRoute>
              <ApprovedPosts />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/discover" 
          element={
            <ProtectedRoute>
              <Discover />
            </ProtectedRoute>
          } 
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;