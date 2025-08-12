import { Loader2 } from "lucide-react";

export function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <Loader2 className="animate-spin h-12 w-12 text-blue-600" />
      <p className="text-gray-600 font-medium">Analyzing SEO tags...</p>
      <p className="text-sm text-gray-500">This may take a few seconds</p>
    </div>
  );
}
