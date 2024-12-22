import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProfileCardProps {
  name: string;
  title: string;
  school: string;
  experience: string;
  imageUrl: string;
}

export const ProfileCard = ({ name, title, school, experience, imageUrl }: ProfileCardProps) => {
  return (
    <Card className="w-full max-w-md animate-fadeIn">
      <CardHeader className="flex flex-row items-center gap-4">
        <img
          src={imageUrl}
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h3 className="text-xl font-semibold">{name}</h3>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-sm">
            <span className="font-semibold">School:</span> {school}
          </p>
          <p className="text-sm">
            <span className="font-semibold">Experience:</span> {experience}
          </p>
          <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90">
            Connect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};