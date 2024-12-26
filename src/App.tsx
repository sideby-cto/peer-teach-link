import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import ApprovedPosts from "./pages/ApprovedPosts";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/approved-posts" element={<ApprovedPosts />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;