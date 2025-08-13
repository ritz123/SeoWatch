import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react';
import type { JobProgress } from '@shared/schema';

interface AnalysisProgressProps {
  progress: JobProgress;
  onDownload?: () => void;
  onCancel?: () => void;
}

export function AnalysisProgress({ progress, onDownload, onCancel }: AnalysisProgressProps) {
  const getStatusIcon = () => {
    switch (progress.status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'processing':
        return <AlertCircle className="h-5 w-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return null;
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) return 'Now';
    if (diffMinutes === 1) return '1 minute';
    if (diffMinutes < 60) return `${diffMinutes} minutes`;
    
    const hours = Math.ceil(diffMinutes / 60);
    return hours === 1 ? '1 hour' : `${hours} hours`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {getStatusIcon()}
            Analysis Progress
          </CardTitle>
          <Badge className={getStatusColor()}>
            {progress.status.charAt(0).toUpperCase() + progress.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">
              {progress.progress.processed} of {progress.progress.total} URLs processed
            </span>
            <span className="font-medium">
              {progress.progress.percentage}%
            </span>
          </div>
          <Progress value={progress.progress.percentage} className="h-2" />
        </div>

        {/* Status Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Total URLs:</span>
            <div className="font-medium">{progress.progress.total}</div>
          </div>
          <div>
            <span className="text-gray-500">Processed:</span>
            <div className="font-medium">{progress.progress.processed}</div>
          </div>
          <div>
            <span className="text-gray-500">Remaining:</span>
            <div className="font-medium">
              {progress.progress.total - progress.progress.processed}
            </div>
          </div>
        </div>

        {/* Time Estimation */}
        {progress.estimatedTimeRemaining && progress.status === 'processing' && (
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Clock className="h-4 w-4" />
              <span>
                Estimated time remaining: {formatTime(progress.estimatedTimeRemaining)}
              </span>
            </div>
          </div>
        )}

        {/* Success Message */}
        {progress.status === 'completed' && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-green-700">
              <CheckCircle className="h-4 w-4" />
              <span>Analysis completed successfully!</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {progress.status === 'failed' && (
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-red-700">
              <XCircle className="h-4 w-4" />
              <span>Analysis failed. Please try again or contact support.</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {progress.status === 'completed' && onDownload && (
            <Button onClick={onDownload} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download Results
            </Button>
          )}
          
          {(progress.status === 'pending' || progress.status === 'processing') && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel Analysis
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
