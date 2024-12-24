import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface TranscriptDropzoneProps {
  onProfileSuggestion: (suggestion: ProfileSuggestion) => void;
}

interface ProfileSuggestion {
  fullName?: string;
  title?: string;
  school?: string;
  experienceYears?: string;
  subjects?: string;
  bio?: string;
}

export function TranscriptDropzone({ onProfileSuggestion }: TranscriptDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processTranscript = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-transcript', {
        body: { transcript: text }
      });

      if (error) throw error;

      return data.suggestion as ProfileSuggestion;
    } catch (error) {
      console.error('Error processing transcript:', error);
      throw error;
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setIsProcessing(true);

    try {
      const file = e.dataTransfer.files[0];
      if (!file) return;

      const text = await file.text();
      const suggestion = await processTranscript(text);
      
      onProfileSuggestion(suggestion);
      
      toast({
        title: "Transcript processed",
        description: "We've analyzed your conversation and suggested profile updates.",
      });
    } catch (error) {
      toast({
        title: "Error processing transcript",
        description: "Failed to process the transcript. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
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
      {isProcessing ? (
        <div className="space-y-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-gray-600">Processing transcript...</p>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Drop your Upduo conversation transcript here
          </p>
          <p className="text-xs text-gray-500">
            We'll analyze it and suggest profile updates
          </p>
        </div>
      )}
    </Card>
  );
}