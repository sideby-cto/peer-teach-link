import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const parseVTTContent = (content: string): string => {
    // Remove WebVTT header and metadata
    const lines = content.split('\n');
    let transcript = '';
    let isInCue = false;

    for (const line of lines) {
      // Skip WebVTT header
      if (line.includes('WEBVTT')) continue;
      // Skip empty lines and timecodes
      if (line.trim() === '' || line.includes('-->')) continue;
      // Skip numeric cue identifiers
      if (/^\d+$/.test(line.trim())) continue;

      // Add the actual text content
      if (line.trim() !== '') {
        transcript += line.trim() + ' ';
      }
    }

    return transcript.trim();
  };

  const processTranscript = async (text: string) => {
    try {
      console.log('Processing transcript:', text.slice(0, 100)); // Log first 100 chars for debugging
      
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

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    await handleFileSelection(file);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await handleFileSelection(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".txt,.vtt"
        className="hidden"
      />
      
      {isProcessing || externalIsProcessing ? (
        <div className="space-y-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
          <p className="text-sm text-gray-600">Processing transcript...</p>
        </div>
      ) : (
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
            <Button
              variant="outline"
              onClick={handleButtonClick}
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload from computer
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
