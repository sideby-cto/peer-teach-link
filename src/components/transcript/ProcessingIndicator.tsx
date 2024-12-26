export const ProcessingIndicator = () => {
  return (
    <div className="space-y-2">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
      <p className="text-sm text-gray-600">Processing transcript...</p>
    </div>
  );
};