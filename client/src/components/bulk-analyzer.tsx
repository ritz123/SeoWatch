import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { FileUpload } from '@/components/ui/file-upload';
import { AnalysisProgress } from '@/components/analysis-progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Download, Trash2, RefreshCw } from 'lucide-react';
import type { JobProgress } from '@shared/schema';

interface BulkJob {
  jobId: string;
  filename: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  totalUrls: number;
  processedUrls: number;
  progress: number;
}

export function BulkAnalyzer() {
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { toast } = useToast();

  // Upload CSV file mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/bulk/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      setCurrentJobId(data.jobId);
      setUploadError(null);
      toast({
        title: 'Upload Successful',
        description: `Started analysis of ${data.totalUrls} URLs`,
      });
    },
    onError: (error: any) => {
      setUploadError(error.message);
      toast({
        title: 'Upload Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  // Query for job progress
  const { data: progress, refetch: refetchProgress } = useQuery({
    queryKey: ['bulkProgress', currentJobId],
    queryFn: async () => {
      if (!currentJobId) return null;
      const response = await apiRequest('GET', `/api/bulk/status/${currentJobId}`);
      return response.json() as Promise<JobProgress>;
    },
    enabled: !!currentJobId,
    refetchInterval: (query) => {
      // Refetch every 2 seconds if job is still processing
      const data = query.state.data;
      return data?.status === 'processing' || data?.status === 'pending' ? 2000 : false;
    },
  });

  // Query for user's jobs list
  const { data: jobsData, refetch: refetchJobs } = useQuery({
    queryKey: ['bulkJobs'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/bulk/jobs');
      return response.json() as Promise<{ jobs: BulkJob[] }>;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Download results mutation
  const downloadMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await fetch(`/api/bulk/download/${jobId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Download failed');
      }
      return { response, jobId };
    },
    onSuccess: async ({ response, jobId }) => {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo_analysis_results_${jobId}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Download Complete',
        description: 'CSV file has been downloaded successfully',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Download Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cancel job mutation
  const cancelMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await apiRequest('DELETE', `/api/bulk/jobs/${jobId}`);
      return response.json();
    },
    onSuccess: () => {
      setCurrentJobId(null);
      refetchJobs();
      toast({
        title: 'Job Cancelled',
        description: 'Analysis job has been cancelled',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Cancellation Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    uploadMutation.mutate(file);
  };

  const handleDownload = (jobId: string) => {
    downloadMutation.mutate(jobId);
  };

  const handleCancel = () => {
    if (currentJobId) {
      cancelMutation.mutate(currentJobId);
    }
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
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

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk SEO Analysis</h1>
        <p className="text-gray-600">
          Upload a CSV file with URLs to analyze multiple websites at once
        </p>
      </div>

      {/* File Upload Section */}
      <div className="space-y-6">
        <FileUpload
          onFileSelect={handleFileSelect}
          isUploading={isUploading}
          error={uploadError || undefined}
        />

        {/* Current Job Progress */}
        {progress && (
          <AnalysisProgress
            progress={progress}
            onDownload={progress.status === 'completed' ? () => handleDownload(progress.jobId) : undefined}
            onCancel={progress.status === 'processing' || progress.status === 'pending' ? handleCancel : undefined}
          />
        )}
      </div>

      {/* Recent Jobs Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Jobs</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetchJobs()}
            disabled={jobsData === undefined}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {jobsData?.jobs && jobsData.jobs.length > 0 ? (
            <div className="space-y-4">
              {jobsData.jobs.map((job) => (
                <div
                  key={job.jobId}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{job.filename}</span>
                      <Badge className={getStatusBadgeColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      {job.totalUrls} URLs • Created {formatDate(job.createdAt)}
                      {job.completedAt && ` • Completed ${formatDate(job.completedAt)}`}
                    </div>
                    {job.status === 'processing' && (
                      <div className="text-sm text-blue-600">
                        Progress: {job.progress}% ({job.processedUrls}/{job.totalUrls})
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {job.status === 'completed' && (
                      <Button
                        size="sm"
                        onClick={() => handleDownload(job.jobId)}
                        disabled={downloadMutation.isPending}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelMutation.mutate(job.jobId)}
                      disabled={cancelMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No bulk analysis jobs yet.</p>
              <p>Upload a CSV file to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
