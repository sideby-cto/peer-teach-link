import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SuggestionAlertProps {
  suggestion: {
    fullName?: string;
    title?: string;
    school?: string;
    experienceYears?: string;
    subjects?: string;
    bio?: string;
  } | null;
  onApply: () => void;
}

export function SuggestionAlert({ suggestion, onApply }: SuggestionAlertProps) {
  if (!suggestion) return null;

  return (
    <Alert>
      <AlertDescription className="space-y-2">
        <p className="font-medium">We found some suggestions from your transcript:</p>
        <ul className="text-sm space-y-1">
          {Object.entries(suggestion).map(([key, value]) => (
            <li key={key}>• {key}: {value}</li>
          ))}
        </ul>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onApply}
          className="mt-2"
        >
          Apply Suggestions
        </Button>
      </AlertDescription>
    </Alert>
  );
}