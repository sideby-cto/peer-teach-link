import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

interface TranscriptDropzoneProps {
  onProfileSuggestion: (suggestion: ProfileSuggestion) => void;
  onPostSuggestion?: (suggestion: { content: string }) => void;
  isProcessing?: boolean;
}

interface ProfileSuggestion {
  fullName?: string;
  title?: string;
  school?: string;
  experienceYears?: string;
  subjects?: string;
  bio?: string;
}

export function TranscriptDropzone({ 
  onProfileSuggestion, 
  onPostSuggestion,
  isProcessing: externalIsProcessing 
}: TranscriptDropzoneProps) {
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
      console.log('Sending transcript to process-transcript function')
      const { data, error } = await supabase.functions.invoke('process-transcript', {
        body: { transcript: text }
      });

      if (error) {
        console.error('Error from process-transcript function:', error);
        throw error;
      }

      console.log('Received response from process-transcript:', data);

      if (data.suggestion) {
        onProfileSuggestion(data.suggestion as ProfileSuggestion);
      }
      
      if (data.postSuggestion && onPostSuggestion) {
        onPostSuggestion(data.postSuggestion);
      }
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
      if (!file) {
        toast({
          title: "No file detected",
          description: "Please try dropping the file again.",
          variant: "destructive",
        });
        return;
      }

      if (file.type !== 'text/plain') {
        toast({
          title: "Invalid file type",
          description: "Please drop a text (.txt) file containing your conversation transcript.",
          variant: "destructive",
        });
        return;
      }

      const text = await file.text();
      if (!text.trim()) {
        toast({
          title: "Empty file",
          description: "The transcript file appears to be empty.",
          variant: "destructive",
        });
        return;
      }

      await processTranscript(text);
      
      toast({
        title: "Transcript processed",
        description: "We've analyzed your conversation and generated content.",
      });
    } catch (error) {
      console.error('Error in handleDrop:', error);
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
      {isProcessing || externalIsProcessing ? (
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
            We'll analyze it and create a post to share your insights
          </p>
        </div>
      )}
    </Card>
  );
}