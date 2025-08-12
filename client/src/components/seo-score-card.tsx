import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { SeoAnalysisResult } from "@shared/schema";

interface SeoScoreCardProps {
  results: SeoAnalysisResult;
}

export function SeoScoreCard({ results }: SeoScoreCardProps) {
  const [showBreakdown, setShowBreakdown] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-score-excellent";
    if (score >= 60) return "bg-score-good";
    return "bg-score-poor";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Improvement";
  };

  return (
    <Card className="shadow-sm border border-gray-200">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">SEO Analysis Results</h2>
            <p className="text-gray-600">{results.url}</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-gray-500">SEO Score</span>
              <div className={`${getScoreColor(results.score)} text-white font-bold text-2xl px-4 py-2 rounded-lg`}>
                {results.score}
              </div>
            </div>
            <div className="text-right mt-1">
              <span className={`text-sm font-medium ${results.score >= 80 ? 'text-score-excellent' : results.score >= 60 ? 'text-score-good' : 'text-score-poor'}`}>
                {getScoreText(results.score)}
              </span>
            </div>
          </div>
        </div>

        {/* Score Breakdown Toggle */}
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <ChevronDown
            className={`transition-transform w-4 h-4 ${showBreakdown ? 'rotate-180' : ''}`}
          />
          <span>View Score Breakdown</span>
        </button>

        {/* Expandable Breakdown */}
        {showBreakdown && (
          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3">Score Calculation</h4>
            {results.breakdown.length > 0 ? (
              <div className="space-y-2">
                {results.breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <span className="text-gray-700">{item.issue}</span>
                    <span className="text-red-600 font-medium">-{item.deduction} points</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 mt-3 pt-3 flex justify-between items-center font-semibold">
                  <span>Total Deductions</span>
                  <span className="text-red-600">
                    -{results.breakdown.reduce((sum, item) => sum + item.deduction, 0)} points
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-green-600 font-medium">Perfect score! No issues found.</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
