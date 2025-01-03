import { Navigation } from "@/components/Navigation";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ProfileCard } from "@/components/ProfileCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Discover = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check auth state on component mount
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        toast({
          title: "Session expired",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        navigate("/");
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        toast({
          title: "Session ended",
          description: "Please sign in again to continue.",
          variant: "destructive",
        });
        navigate("/");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers", searchTerm],
    queryFn: async () => {
      try {
        let query = supabase
          .from("teachers")
          .select("*");

        if (searchTerm) {
          query = query.or(`full_name.ilike.%${searchTerm}%,school.ilike.%${searchTerm}%,subjects.cs.{${searchTerm}}`);
        }

        const { data, error } = await query.limit(20);
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast({
          title: "Error",
          description: "Failed to load teachers. Please try again.",
          variant: "destructive",
        });
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-white">
      <Navigation />
      <main className="pt-20 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <h1 className="text-2xl font-bold">Discover Teachers</h1>
          
          <Input
            type="search"
            placeholder="Search by name, school, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : teachers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No teachers found. Try adjusting your search terms.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teachers.map((teacher) => (
                <ProfileCard
                  key={teacher.id}
                  name={teacher.full_name}
                  title={teacher.title || "Teacher"}
                  school={teacher.school || "School not specified"}
                  experience={`${teacher.experience_years || 0} years in education`}
                  imageUrl={teacher.avatar_url || "/placeholder.svg"}
                  teacherId={teacher.id}
                  stance={teacher.stance}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Discover;