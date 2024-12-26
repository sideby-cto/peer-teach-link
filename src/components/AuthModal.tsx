import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { TeacherProfileForm } from "./TeacherProfileForm";
import { AuthForm } from "./auth/AuthForm";
import { useAuthSession } from "@/hooks/useAuthSession";

export function AuthModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { checkSession } = useAuthSession();
  const { toast } = useToast();

  useEffect(() => {
    if (showProfileForm) {
      const verifySession = async () => {
        const isValid = await checkSession();
        if (!isValid) {
          setShowProfileForm(false);
          onClose();
        }
      };
      verifySession();
    }
  }, [showProfileForm, checkSession, onClose]);

  const handleAuthSuccess = (newUserId: string) => {
    if (newUserId) {
      setUserId(newUserId);
      setShowProfileForm(true);
    } else {
      onClose();
    }
  };

  const handleProfileComplete = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {showProfileForm ? (
          <>
            <DialogHeader>
              <DialogTitle>Complete Your Profile</DialogTitle>
              <DialogDescription>
                Tell us about yourself to help other teachers connect with you
              </DialogDescription>
            </DialogHeader>
            {userId && (
              <TeacherProfileForm
                userId={userId}
                onComplete={handleProfileComplete}
              />
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Welcome</DialogTitle>
              <DialogDescription>
                Join our community of educators or sign in to continue
              </DialogDescription>
            </DialogHeader>
            <AuthForm onSuccess={handleAuthSuccess} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}