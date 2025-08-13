import { z } from "zod";

export const seoAnalysisRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export const seoTagSchema = z.object({
  tag: z.string(),
  content: z.string(),
  status: z.enum(["good", "warning", "missing", "error"]),
  feedback: z.string(),
  deduction: z.number().default(0),
});

export const seoScoreBreakdownSchema = z.object({
  tag: z.string(),
  issue: z.string(),
  deduction: z.number(),
});

export const seoAnalysisResultSchema = z.object({
  url: z.string(),
  score: z.number().min(0).max(100),
  tags: z.array(seoTagSchema),
  breakdown: z.array(seoScoreBreakdownSchema),
  previews: z.object({
    google: z.object({
      title: z.string(),
      description: z.string(),
      url: z.string(),
    }),
    facebook: z.object({
      title: z.string(),
      description: z.string(),
      image: z.string().optional(),
      domain: z.string(),
    }),
    twitter: z.object({
      title: z.string(),
      description: z.string(),
      image: z.string().optional(),
      card: z.string(),
      domain: z.string(),
    }),
    linkedin: z.object({
      title: z.string(),
      description: z.string(),
      image: z.string().optional(),
      domain: z.string(),
    }),
  }),
});

// Bulk Analysis Schemas
export const bulkAnalysisJobSchema = z.object({
  id: z.string(),
  userSession: z.string(),
  filename: z.string(),
  totalUrls: z.number(),
  processedUrls: z.number().default(0),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  createdAt: z.string(),
  completedAt: z.string().optional(),
  resultFilePath: z.string().optional(),
});

export const bulkUrlResultSchema = z.object({
  id: z.string(),
  jobId: z.string(),
  url: z.string(),
  analysisResult: seoAnalysisResultSchema.optional(),
  errorMessage: z.string().optional(),
  processedAt: z.string(),
});

export const csvUploadRequestSchema = z.object({
  file: z.any(), // Will be validated by multer
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

export const jobProgressSchema = z.object({
  jobId: z.string(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  progress: z.object({
    total: z.number(),
    processed: z.number(),
    percentage: z.number(),
  }),
  estimatedTimeRemaining: z.string().optional(),
});

// User schema (for compatibility with existing storage)
export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export const insertUserSchema = userSchema.omit({ id: true });

// Type exports
export type SeoAnalysisRequest = z.infer<typeof seoAnalysisRequestSchema>;
export type SeoTag = z.infer<typeof seoTagSchema>;
export type SeoScoreBreakdown = z.infer<typeof seoScoreBreakdownSchema>;
export type SeoAnalysisResult = z.infer<typeof seoAnalysisResultSchema>;
export type BulkAnalysisJob = z.infer<typeof bulkAnalysisJobSchema>;
export type BulkUrlResult = z.infer<typeof bulkUrlResultSchema>;
export type BulkAnalysisResult = z.infer<typeof bulkAnalysisResultSchema>;
export type JobProgress = z.infer<typeof jobProgressSchema>;
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertBulkAnalysisJob = Omit<BulkAnalysisJob, 'id' | 'createdAt'>;
export type InsertBulkUrlResult = Omit<BulkUrlResult, 'id' | 'processedAt'>;
