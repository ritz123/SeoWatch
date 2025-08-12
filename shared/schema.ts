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

export type SeoAnalysisRequest = z.infer<typeof seoAnalysisRequestSchema>;
export type SeoTag = z.infer<typeof seoTagSchema>;
export type SeoScoreBreakdown = z.infer<typeof seoScoreBreakdownSchema>;
export type SeoAnalysisResult = z.infer<typeof seoAnalysisResultSchema>;
