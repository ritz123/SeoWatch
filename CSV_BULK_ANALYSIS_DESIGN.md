# Product Design Document: CSV Bulk SEO Analysis Feature

## 1. Executive Summary

### 1.1 Overview
This document outlines the design for adding bulk SEO analysis functionality to SeoWatch, allowing users to upload CSV files containing multiple URLs and download comprehensive SEO reports in CSV format.

### 1.2 Current State
SeoWatch currently supports single URL analysis with the following capabilities:
- Individual URL SEO analysis via `/api/analyze` endpoint
- Real-time scoring and tag validation
- Social media preview generation
- Interactive web interface

### 1.3 Proposed Enhancement
Add bulk processing capabilities that enable:
- CSV file upload with multiple URLs
- Batch SEO analysis processing
- Progress tracking for long-running analyses
- CSV report download with comprehensive SEO data
- Queue management for handling large datasets

## 2. Business Requirements

### 2.1 User Stories
- **As a SEO professional**, I want to upload a CSV file with hundreds of URLs so that I can analyze multiple websites efficiently
- **As a marketing manager**, I want to download SEO analysis results in CSV format so that I can create reports and share insights with stakeholders
- **As a website auditor**, I want to track the progress of bulk analysis so that I know when my report will be ready
- **As a user**, I want to be notified when my bulk analysis is complete so that I can download the results

### 2.2 Success Criteria
- Users can upload CSV files with up to 1000 URLs
- Bulk analysis completes within reasonable time (target: 1-2 minutes per 100 URLs)
- Downloaded CSV reports contain all current SEO metrics
- 99% analysis success rate for valid URLs
- Progress tracking updates in real-time

## 3. Technical Architecture

### 3.1 System Components

#### 3.1.1 Frontend Components
```
client/src/components/
├── bulk-analyzer.tsx          # New: Main bulk analysis interface
├── csv-upload.tsx             # New: File upload component
├── analysis-progress.tsx      # New: Progress tracking component
├── bulk-results.tsx           # New: Results display and download
└── ui/
    ├── file-upload.tsx        # New: Reusable file upload UI
    └── progress-bar.tsx       # New: Progress visualization
```

#### 3.1.2 Backend Services
```
server/
├── routes.ts                  # Enhanced with bulk endpoints
├── bulk-processor.ts          # New: Bulk analysis engine
├── csv-parser.ts              # New: CSV processing utilities
├── job-queue.ts               # New: Background job management
└── storage.ts                 # Enhanced for job persistence
```

#### 3.1.3 Database Schema Extensions
```sql
-- Jobs table for tracking bulk analysis
CREATE TABLE bulk_analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_session VARCHAR(255),
  filename VARCHAR(255),
  total_urls INTEGER,
  processed_urls INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  result_file_path VARCHAR(255)
);

-- URL results table for individual analysis within bulk jobs
CREATE TABLE bulk_url_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES bulk_analysis_jobs(id),
  url TEXT,
  analysis_result JSONB,
  error_message TEXT,
  processed_at TIMESTAMP DEFAULT NOW()
);
```

### 3.2 API Endpoints

#### 3.2.1 New Bulk Analysis Endpoints

**POST /api/bulk/upload**
```typescript
Request: FormData with CSV file
Response: {
  jobId: string;
  totalUrls: number;
  estimatedCompletionTime: string;
}
```

**GET /api/bulk/status/:jobId**
```typescript
Response: {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: {
    total: number;
    processed: number;
    percentage: number;
  };
  estimatedTimeRemaining: string;
}
```

**GET /api/bulk/download/:jobId**
```typescript
Response: CSV file download with analysis results
```

**GET /api/bulk/jobs**
```typescript
Response: {
  jobs: Array<{
    jobId: string;
    filename: string;
    status: string;
    createdAt: string;
    totalUrls: number;
  }>;
}
```

#### 3.2.2 Enhanced Schema Types
```typescript
// shared/schema.ts additions
export const bulkAnalysisJobSchema = z.object({
  jobId: z.string(),
  filename: z.string(),
  totalUrls: z.number(),
  processedUrls: z.number(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

export const csvUploadRequestSchema = z.object({
  file: z.instanceof(File),
});

export const bulkAnalysisResultSchema = z.object({
  url: z.string(),
  seoScore: z.number(),
  titleTag: z.string(),
  titleLength: z.number(),
  metaDescription: z.string(),
  metaDescriptionLength: z.number(),
  h1Tag: z.string(),
  ogTitle: z.string(),
  ogDescription: z.string(),
  ogImage: z.string(),
  twitterTitle: z.string(),
  twitterDescription: z.string(),
  twitterCard: z.string(),
  robotsTag: z.string(),
  canonicalUrl: z.string(),
  analysisDate: z.string(),
  errorMessage: z.string().optional(),
});
```

## 4. User Interface Design

### 4.1 Navigation Enhancement
- Add "Bulk Analysis" tab to main navigation
- Maintain existing "Single URL" analysis as default

### 4.2 Bulk Analysis Page Layout
```
┌─────────────────────────────────────────────────────────┐
│ SEO Watch - Bulk Analysis                               │
├─────────────────────────────────────────────────────────┤
│ Upload CSV File                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [📄 Drop CSV file here or click to browse]          │ │
│ │ Supported format: URL column required               │ │
│ │ Max file size: 10MB | Max URLs: 1000               │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                         │
│ Recent Jobs                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ filename.csv | 250 URLs | ✅ Completed | [Download] │ │
│ │ sites.csv    | 100 URLs | 🔄 Processing (45%)      │ │
│ │ audit.csv    | 500 URLs | ⏳ Pending               │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### 4.3 Progress Tracking Interface
```
┌─────────────────────────────────────────────────────────┐
│ Analysis Progress: filename.csv                          │
├─────────────────────────────────────────────────────────┤
│ ████████████████░░░░░░░░ 65% Complete                   │
│ 325 of 500 URLs processed                               │
│ Estimated time remaining: 2 minutes                     │
│                                                         │
│ Last processed: https://example.com (Score: 85)         │
│ Success rate: 98.5% (3 failed URLs)                     │
│                                                         │
│ [Cancel Analysis] [View Partial Results]                │
└─────────────────────────────────────────────────────────┘
```

### 4.4 CSV Report Format
```csv
URL,SEO_Score,Title_Tag,Title_Length,Meta_Description,Meta_Description_Length,H1_Tag,OG_Title,OG_Description,OG_Image,Twitter_Title,Twitter_Description,Twitter_Card,Robots_Tag,Canonical_URL,Analysis_Date,Error_Message
https://example.com,85,"Example Site - Best Products",28,"Quality products at great prices",32,"Welcome to Example","Example Site","Quality products","/og-image.jpg","Example Site","Quality products","summary","index,follow","https://example.com","2025-08-13T10:30:00Z",
https://broken-site.com,0,"","","","","","","","","","","","","","2025-08-13T10:30:15Z","Unable to reach the specified URL"
```

## 5. Implementation Strategy

### 5.1 Phase 1: Core Infrastructure (Week 1-2)
- Database schema setup
- Basic file upload endpoint
- CSV parsing functionality
- Job queue implementation

### 5.2 Phase 2: Bulk Processing Engine (Week 3-4)
- Background job processor
- Progress tracking system
- Error handling and retry logic
- Rate limiting for external requests

### 5.3 Phase 3: User Interface (Week 5-6)
- File upload component
- Progress tracking UI
- Job management interface
- CSV download functionality

### 5.4 Phase 4: Testing & Optimization (Week 7-8)
- Performance testing with large datasets
- Error scenario testing
- UI/UX refinements
- Documentation updates

## 6. Technical Considerations

### 6.1 Performance Requirements
- **Concurrency**: Process up to 10 URLs simultaneously
- **Memory Management**: Stream processing for large files
- **Database Optimization**: Efficient indexing for job queries
- **Caching**: Redis for job status and progress tracking

### 6.2 Error Handling
- Invalid CSV format validation
- URL accessibility checks
- Timeout handling for slow websites
- Partial result recovery
- User notification system

### 6.3 Security Considerations
- File type validation (CSV only)
- File size limits (10MB max)
- URL validation and sanitization
- Rate limiting per user session
- Temporary file cleanup

### 6.4 Scalability
- Horizontal scaling with worker processes
- Database partitioning for large job volumes
- CDN integration for file storage
- Auto-scaling based on queue depth

## 7. Dependencies and Libraries

### 7.1 New Dependencies
```json
{
  "multer": "^1.4.5",           // File upload handling
  "csv-parser": "^3.0.0",       // CSV parsing
  "csv-writer": "^1.6.0",       // CSV generation
  "bull": "^4.12.0",            // Job queue management
  "redis": "^4.6.0",            // Caching and queue storage
  "node-cron": "^3.0.0"         // Cleanup scheduling
}
```

### 7.2 Frontend Dependencies
```json
{
  "react-dropzone": "^14.2.0",  // File upload UI
  "papaparse": "^5.4.0",        // CSV preview functionality
  "socket.io-client": "^4.7.0"  // Real-time progress updates
}
```

## 8. Testing Strategy

### 8.1 Unit Tests
- CSV parsing validation
- SEO analysis consistency
- Job queue functionality
- Error handling scenarios

### 8.2 Integration Tests
- End-to-end bulk analysis workflow
- File upload and download
- Progress tracking accuracy
- Database transaction integrity

### 8.3 Performance Tests
- Large file processing (1000+ URLs)
- Concurrent user scenarios
- Memory usage monitoring
- Database query optimization

## 9. Success Metrics

### 9.1 Performance Metrics
- Average processing time per URL: < 2 seconds
- Bulk analysis completion rate: > 95%
- System uptime during bulk operations: > 99%
- Memory usage efficiency: < 100MB per 100 URLs

### 9.2 User Experience Metrics
- File upload success rate: > 99%
- User completion rate: > 85%
- Error recovery rate: > 90%
- User satisfaction score: > 4.5/5

## 10. Risk Mitigation

### 10.1 Technical Risks
- **Memory overflow**: Implement streaming and chunked processing
- **Database deadlocks**: Use proper transaction isolation
- **External API failures**: Implement retry logic and fallbacks
- **File corruption**: Add checksum validation

### 10.2 Business Risks
- **Server overload**: Implement queue limits and rate limiting
- **Data privacy**: Ensure temporary file cleanup
- **Cost escalation**: Monitor and cap processing resources
- **User frustration**: Provide clear error messages and help

## 11. Future Enhancements

### 11.1 Short-term (3-6 months)
- Email notifications for job completion
- Advanced filtering and search in results
- Export to multiple formats (Excel, JSON)
- Scheduled recurring analysis

### 11.2 Long-term (6-12 months)
- API integration with popular SEO tools
- Historical trend analysis
- Advanced reporting and visualization
- Team collaboration features

## 12. Conclusion

This CSV bulk analysis feature will significantly enhance SeoWatch's value proposition by enabling professional SEO auditors and marketing teams to efficiently analyze large numbers of URLs. The phased implementation approach ensures minimal risk while delivering incremental value to users.

The design prioritizes performance, scalability, and user experience while maintaining the high-quality analysis standards established in the current single-URL feature.
