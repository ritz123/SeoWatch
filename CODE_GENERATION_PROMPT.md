# Code Generation Prompt: CSV Bulk SEO Analysis Feature

## Context
You are implementing a CSV bulk analysis feature for SeoWatch, an existing SEO analysis tool built with React (frontend) and Node.js/Express (backend). The application currently supports single URL analysis and needs to be extended to handle bulk CSV uploads and downloads.

## Current Technology Stack
- **Frontend**: React + TypeScript, Vite, TailwindCSS, Shadcn/ui components, TanStack Query, Wouter routing
- **Backend**: Node.js + Express + TypeScript, Cheerio for HTML parsing, Axios for HTTP requests, Zod for validation
- **Database**: PostgreSQL with Drizzle ORM (with in-memory storage fallback)
- **Testing**: Jest with experimental VM modules

## Existing File Structure
```
SeoWatch/
├── client/src/
│   ├── components/
│   │   ├── seo-analyzer.tsx (main analysis component)
│   │   ├── seo-score-card.tsx
│   │   ├── seo-tags-table.tsx
│   │   ├── preview-cards.tsx
│   │   └── ui/ (shadcn components)
│   ├── pages/home.tsx
│   └── lib/queryClient.ts
├── server/
│   ├── index.ts
│   ├── routes.ts (contains /api/analyze endpoint)
│   └── storage.ts
├── shared/schema.ts (Zod schemas)
└── __tests__/routes.test.ts
```

## Current API Endpoints
- `POST /api/analyze` - Analyzes a single URL and returns SEO data

## Feature Requirements
Implement a CSV bulk analysis feature that allows users to:
1. Upload CSV files with URLs (max 1000 URLs, 10MB file size)
2. Process URLs in background with progress tracking
3. Download comprehensive SEO reports in CSV format
4. View job status and manage multiple analysis jobs

## Code Generation Tasks

### Task 1: Database Schema and Migration
Generate code for:
- Database schema for bulk analysis jobs and URL results
- Migration scripts using Drizzle ORM
- Update existing storage.ts to handle bulk operations

**Requirements:**
- Use UUID for job IDs
- Track job status (pending, processing, completed, failed)
- Store individual URL results with error handling
- Include timestamps and progress tracking

### Task 2: Backend API Endpoints
Generate code for new API endpoints:
- `POST /api/bulk/upload` - Handle CSV file upload
- `GET /api/bulk/status/:jobId` - Get job progress status
- `GET /api/bulk/download/:jobId` - Download CSV results
- `GET /api/bulk/jobs` - List user's jobs

**Requirements:**
- Use multer for file uploads
- Implement proper error handling and validation
- Add rate limiting and security measures
- Integrate with existing SEO analysis logic from routes.ts

### Task 3: Background Job Processing
Generate code for:
- Job queue system using Bull/Redis or in-memory alternative
- Background worker to process URLs from CSV
- Progress tracking and status updates
- Error handling and retry logic

**Requirements:**
- Process up to 10 URLs concurrently
- Update job progress in real-time
- Handle failed URLs gracefully
- Generate CSV output with all SEO metrics

### Task 4: CSV Processing Utilities
Generate code for:
- CSV parsing and validation
- CSV generation with SEO results
- File handling and cleanup utilities

**Requirements:**
- Support CSV files with URL column (flexible column names)
- Generate comprehensive CSV output with all existing SEO metrics
- Proper file cleanup after processing
- Input validation and sanitization

### Task 5: Frontend Components
Generate React components for:
- `bulk-analyzer.tsx` - Main bulk analysis interface
- `csv-upload.tsx` - File upload component with drag & drop
- `analysis-progress.tsx` - Progress tracking component
- `bulk-results.tsx` - Results display and download

**Requirements:**
- Use existing UI components from shadcn/ui
- Implement proper TypeScript typing
- Add form validation and error handling
- Include responsive design
- Integrate with TanStack Query for API calls

### Task 6: Schema Updates
Generate updated Zod schemas in shared/schema.ts:
- Bulk analysis job schema
- CSV upload request schema
- Bulk analysis result schema
- Progress tracking schema

### Task 7: Navigation and Routing
Generate code to:
- Add "Bulk Analysis" tab to main navigation
- Create new route for bulk analysis page
- Update App.tsx and routing configuration

### Task 8: Test Cases
Generate comprehensive test cases for:
- CSV upload and parsing
- Bulk analysis processing
- API endpoint testing
- Frontend component testing
- Error scenario testing

**Test Requirements:**
- Unit tests for all new functions
- Integration tests for bulk workflow
- Mock CSV files for testing
- Error handling test cases
- Performance testing scenarios

## Technical Constraints
1. **File Size**: Maximum 10MB CSV files
2. **URL Limit**: Maximum 1000 URLs per batch
3. **Concurrency**: Process maximum 10 URLs simultaneously
4. **Timeout**: 30-second timeout per URL analysis
5. **Memory**: Efficient memory usage for large files
6. **Security**: Validate file types, sanitize inputs, rate limiting

## Code Style Guidelines
1. Use TypeScript with strict type checking
2. Follow existing naming conventions in the codebase
3. Use async/await for asynchronous operations
4. Implement proper error handling with try-catch blocks
5. Add JSDoc comments for complex functions
6. Use existing UI patterns from shadcn/ui
7. Follow React hooks best practices
8. Maintain consistency with existing API patterns

## Integration Points
1. **Reuse existing SEO analysis logic** from routes.ts analyzeSeoTags function
2. **Extend current storage system** in storage.ts
3. **Use existing UI components** and styling patterns
4. **Integrate with current queryClient** setup
5. **Follow existing error handling** patterns with toast notifications

## Output Format Requirements
For each generated file:
1. Include proper imports and dependencies
2. Add TypeScript interfaces and types
3. Include error handling and validation
4. Add comprehensive JSDoc comments
5. Follow existing code structure and patterns
6. Include proper export statements

## Example Usage Patterns
When generating code, follow these existing patterns:

**API Endpoint Pattern:**
```typescript
app.post('/api/endpoint', async (req, res) => {
  try {
    const validatedData = schema.parse(req.body);
    // Implementation
    res.json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({ error: error.issues });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});
```

**React Component Pattern:**
```typescript
export function ComponentName() {
  const [state, setState] = useState<Type>(initialValue);
  const { toast } = useToast();
  
  const mutation = useMutation({
    mutationFn: async (data) => apiRequest("POST", "/api/endpoint", data),
    onSuccess: (result) => {
      // Handle success
    },
    onError: (error) => {
      toast({
        title: "Error Title",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    // JSX implementation
  );
}
```

## Success Criteria
The generated code should:
1. Compile without TypeScript errors
2. Pass all generated test cases
3. Integrate seamlessly with existing codebase
4. Handle edge cases and errors gracefully
5. Follow security best practices
6. Provide good user experience with loading states and feedback
7. Be scalable and maintainable

## Priority Order
Generate code in this order for dependency management:
1. Database schema and migration
2. Zod schema updates
3. Backend utilities (CSV processing, job queue)
4. API endpoints
5. Frontend components
6. Navigation and routing updates
7. Test cases

Generate production-ready, well-documented code that seamlessly integrates with the existing SeoWatch application while implementing the complete CSV bulk analysis feature as specified in the design document.
