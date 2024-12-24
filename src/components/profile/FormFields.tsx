import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface FormFieldsProps {
  formData: {
    fullName: string;
    title: string;
    school: string;
    experienceYears: string;
    subjects: string;
    bio: string;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export function FormFields({ formData, handleChange }: FormFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="e.g. Math Teacher, Science Department Head"
          value={formData.title}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="school">School</Label>
        <Input
          id="school"
          name="school"
          value={formData.school}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="experienceYears">Years of Experience</Label>
        <Input
          id="experienceYears"
          name="experienceYears"
          type="number"
          min="0"
          value={formData.experienceYears}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subjects">Subjects (comma-separated)</Label>
        <Input
          id="subjects"
          name="subjects"
          placeholder="e.g. Mathematics, Physics, Computer Science"
          value={formData.subjects}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          placeholder="Tell us about yourself and your teaching philosophy"
          value={formData.bio}
          onChange={handleChange}
          required
        />
      </div>
    </>
  );
}