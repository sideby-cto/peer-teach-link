import { useState, useEffect } from "react";
import { AuthModal } from "./AuthModal";
import { supabase } from "@/lib/supabase";
import { AuthButtons } from "./navigation/AuthButtons";
import { UserMenu } from "./navigation/UserMenu";
import { NotificationButtons } from "./navigation/NotificationButtons";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Navigation = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const navigationItems = [
    {
      title: "Timeline",
      href: "/",
      description: "View and share teaching insights"
    },
    {
      title: "Approved Posts",
      href: "/approved-posts",
      description: "Browse approved teaching conversations"
    },
    {
      title: "My Profile",
      href: "/profile",
      description: "View and edit your profile"
    }
  ];

  return (
    <nav className="bg-primary py-4 px-6 fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/" className="text-2xl font-bold text-white">
            sideby
          </Link>

          {user && (
            <NavigationMenu>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-white bg-transparent hover:bg-primary/80">
                    Menu
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4">
                      {navigationItems.map((item) => (
                        <li key={item.href}>
                          <Link
                            to={item.href}
                            className={cn(
                              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors",
                              "hover:bg-accent hover:text-accent-foreground",
                              location.pathname === item.href && "bg-accent"
                            )}
                          >
                            <div className="text-sm font-medium leading-none">{item.title}</div>
                            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                              {item.description}
                            </p>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <AuthButtons 
            loading={loading}
            user={user}
            setIsAuthModalOpen={setIsAuthModalOpen}
          />
          {user && (
            <>
              <NotificationButtons />
              <UserMenu user={user} />
            </>
          )}
        </div>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </nav>
  );
};