import { useState } from "react";
import { Card } from "@/components/ui/card";
import { DropzoneContent } from "./transcript/DropzoneContent";
import { useTranscriptProcessing } from "./transcript/useTranscriptProcessing";

interface PostSuggestion {
  content: string;
  post_type: 'short' | 'article';
}

interface ProfileSuggestion {
  fullName?: string;
  title?: string;
  school?: string;
  experienceYears?: string;
  subjects?: string;
  bio?: string;
}

interface TranscriptDropzoneProps {
  onProfileSuggestion: (suggestion: ProfileSuggestion) => void;
  onPostSuggestion?: (suggestions: PostSuggestion[]) => void;
  isProcessing?: boolean;
}

export function TranscriptDropzone({ 
  onProfileSuggestion, 
  onPostSuggestion,
  isProcessing: externalIsProcessing 
}: TranscriptDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  
  const { isProcessing, handleFileSelection } = useTranscriptProcessing({
    onProfileSuggestion,
    onPostSuggestion
  });

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    await handleFileSelection(file);
  };

  return (
    <Card
      className={`p-6 border-2 border-dashed ${
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
      } rounded-lg text-center cursor-pointer transition-colors`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <DropzoneContent 
        isProcessing={isProcessing || !!externalIsProcessing} 
        onFileSelect={handleFileSelection}
      />
    </Card>
  );
}