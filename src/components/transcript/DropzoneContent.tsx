import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileInput } from "./FileInput";

interface DropzoneContentProps {
  isProcessing: boolean;
  onFileSelect: (file: File) => Promise<void>;
}

export const DropzoneContent = ({ isProcessing, onFileSelect }: DropzoneContentProps) => {
  if (isProcessing) {
    return (
      <div className="space-y-2">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
        <p className="text-sm text-gray-600">Processing transcript...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm text-gray-600">
          Drop your Upduo conversation transcript here (.txt or .vtt)
        </p>
        <p className="text-xs text-gray-500">
          We'll analyze it and create a post to share your insights
        </p>
      </div>
      <div className="flex justify-center">
        <FileInput onFileSelect={onFileSelect} isProcessing={isProcessing} />
      </div>
    </div>
  );
};