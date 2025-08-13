import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
  error?: string;
}

export function FileUpload({ onFileSelect, isUploading = false, error }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled: isUploading
  });

  return (
    <div className="w-full">
      <Card 
        className={`transition-all duration-200 ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 
          isDragReject ? 'border-red-500 bg-red-50' : 
          'border-gray-300 hover:border-gray-400'
        } ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <CardContent className="p-8">
          <div {...getRootProps()} className="text-center">
            <input {...getInputProps()} />
            
            <div className="flex flex-col items-center space-y-4">
              {isDragReject ? (
                <AlertCircle className="h-12 w-12 text-red-500" />
              ) : (
                <Upload className={`h-12 w-12 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`} />
              )}
              
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {isDragActive ? 'Drop your CSV file here' : 'Upload CSV File'}
                </h3>
                
                <p className="text-sm text-gray-600">
                  {isDragReject ? (
                    'Only CSV files are allowed'
                  ) : (
                    'Drop your CSV file here or click to browse'
                  )}
                </p>
                
                <div className="text-xs text-gray-500">
                  <p>• Supported format: CSV with URL column</p>
                  <p>• Max file size: 10MB</p>
                  <p>• Max URLs: 1000 per batch</p>
                </div>
              </div>
              
              {!isDragActive && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  disabled={isUploading}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  {isUploading ? 'Processing...' : 'Select File'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
