import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

interface ProfileSuggestion {
  fullName?: string;
  title?: string;
  school?: string;
  experienceYears?: string;
  subjects?: string;
  bio?: string;
}

interface PostSuggestion {
  content: string;
  post_type: 'short' | 'article';
}

interface UseTranscriptProcessingProps {
  onProfileSuggestion: (suggestion: ProfileSuggestion) => void;
  onPostSuggestion?: (suggestions: PostSuggestion[]) => void;
}

export const useTranscriptProcessing = ({ 
  onProfileSuggestion, 
  onPostSuggestion 
}: UseTranscriptProcessingProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const parseVTTContent = (content: string): string => {
    const lines = content.split('\n');
    let transcript = '';

    for (const line of lines) {
      if (line.includes('WEBVTT')) continue;
      if (line.trim() === '' || line.includes('-->')) continue;
      if (/^\d+$/.test(line.trim())) continue;

      if (line.trim() !== '') {
        transcript += line.trim() + ' ';
      }
    }

    return transcript.trim();
  };

  const processTranscript = async (text: string) => {
    try {
      console.log('Processing transcript:', text.slice(0, 100));
      
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
      
      if (data.postSuggestions && onPostSuggestion) {
        onPostSuggestion(data.postSuggestions);
      }
    } catch (error) {
      console.error('Error processing transcript:', error);
      throw error;
    }
  };

  const handleFileSelection = async (file: File) => {
    if (!file) {
      toast({
        title: "No file detected",
        description: "Please try selecting the file again.",
        variant: "destructive",
      });
      return;
    }

    if (file.type !== 'text/plain' && !file.name.endsWith('.vtt')) {
      toast({
        title: "Invalid file type",
        description: "Please select a text (.txt) or subtitle (.vtt) file containing your conversation transcript.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const text = await file.text();
      if (!text.trim()) {
        toast({
          title: "Empty file",
          description: "The transcript file appears to be empty.",
          variant: "destructive",
        });
        return;
      }

      const processedText = file.name.endsWith('.vtt') ? parseVTTContent(text) : text;
      await processTranscript(processedText);
      
      toast({
        title: "Transcript processed",
        description: "We've analyzed your conversation and generated content.",
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error processing transcript",
        description: "Failed to process the transcript. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    isProcessing,
    handleFileSelection
  };
};