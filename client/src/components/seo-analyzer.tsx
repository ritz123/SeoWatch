import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { SeoScoreCard } from "./seo-score-card";
import { SeoTagsTable } from "./seo-tags-table";
import { PreviewCards } from "./preview-cards";
import { LoadingSpinner } from "./ui/loading-spinner";
import type { SeoAnalysisResult } from "@shared/schema";

export function SeoAnalyzer() {
  const [url, setUrl] = useState("");
  const [results, setResults] = useState<SeoAnalysisResult | null>(null);
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async (url: string) => {
      const response = await apiRequest("POST", "/api/analyze", { url });
      return response.json() as Promise<SeoAnalysisResult>;
    },
    onSuccess: (data) => {
      setResults(data);
      // Scroll to results
      setTimeout(() => {
        const resultsElement = document.getElementById("results-section");
        if (resultsElement) {
          resultsElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Analysis Failed",
        description: error.message || "Unable to analyze the URL. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAnalyze = () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a valid URL to analyze.",
        variant: "destructive",
      });
      return;
    }

    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = 'https://' + finalUrl;
      setUrl(finalUrl);
    }

    analysisMutation.mutate(finalUrl);
  };

  const handleClearResults = () => {
    if (window.confirm('Are you sure you want to clear the current results?')) {
      setResults(null);
      setUrl('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAnalyze();
    }
  };

  return (
    <div className="space-y-8">
      {/* URL Analysis Form */}
      <Card className="shadow-sm border border-gray-200">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL to Analyze
              </Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://www.example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                className="px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={analysisMutation.isPending}
              />
            </div>
            <div className="flex items-end">
              <Button
                onClick={handleAnalyze}
                disabled={analysisMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 w-full sm:w-auto h-12"
              >
                <Search className="mr-2 h-4 w-4" />
                Analyze SEO
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {analysisMutation.isPending && (
        <Card className="shadow-sm border border-gray-200">
          <CardContent className="p-8">
            <LoadingSpinner />
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {results && (
        <div id="results-section" className="space-y-8">
          <SeoScoreCard results={results} />
          <SeoTagsTable tags={results.tags} />
          <PreviewCards previews={results.previews} />
          
          {/* Quick Actions */}
          <Card className="shadow-sm border border-gray-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-medium">
                  <span>Export Report</span>
                </Button>
                <Button variant="secondary" className="flex items-center justify-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-medium">
                  <span>Share Results</span>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleClearResults}
                  className="flex items-center justify-center space-x-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
                >
                  <span>Clear Results</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
