import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileInputProps {
  onFileSelect: (file: File) => Promise<void>;
  isProcessing: boolean;
}

export const FileInput = ({ onFileSelect, isProcessing }: FileInputProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onFileSelect(file);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".txt,.vtt"
        className="hidden"
      />
      {!isProcessing && (
        <Button
          variant="outline"
          onClick={handleButtonClick}
          className="gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload from computer
        </Button>
      )}
    </>
  );
};