import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";
import * as cheerio from "cheerio";
import { seoAnalysisRequestSchema, type SeoAnalysisResult, type SeoTag, type SeoScoreBreakdown } from "@shared/schema";
import { ZodError } from "zod";

function sanitizeText(text: string): string {
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
             .replace(/<[^>]*>/g, '')
             .trim();
}

function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

function analyzeSeoTags($: cheerio.CheerioAPI, url: string): {
  tags: SeoTag[];
  breakdown: SeoScoreBreakdown[];
  score: number;
} {
  const tags: SeoTag[] = [];
  const breakdown: SeoScoreBreakdown[] = [];
  let score = 100;

  // Title analysis
  const title = $('title').first().text().trim();
  if (!title) {
    tags.push({
      tag: "Title",
      content: "-",
      status: "missing",
      feedback: "Title tag is missing",
      deduction: 25
    });
    breakdown.push({
      tag: "Title",
      issue: "Missing title tag",
      deduction: 25
    });
    score -= 25;
  } else {
    const titleLength = title.length;
    if (titleLength < 30) {
      tags.push({
        tag: "Title",
        content: sanitizeText(title),
        status: "warning",
        feedback: `Title is too short (${titleLength} chars, recommended 50-60)`,
        deduction: 10
      });
      breakdown.push({
        tag: "Title",
        issue: "Title too short",
        deduction: 10
      });
      score -= 10;
    } else if (titleLength > 60) {
      tags.push({
        tag: "Title",
        content: sanitizeText(title),
        status: "warning",
        feedback: `Title is too long (${titleLength} chars, recommended 50-60)`,
        deduction: 10
      });
      breakdown.push({
        tag: "Title",
        issue: "Title too long",
        deduction: 10
      });
      score -= 10;
    } else {
      tags.push({
        tag: "Title",
        content: sanitizeText(title),
        status: "good",
        feedback: `Perfect length (${titleLength} chars)`,
        deduction: 0
      });
    }
  }

  // Meta description analysis
  const description = $('meta[name="description"]').attr('content')?.trim() || '';
  if (!description) {
    tags.push({
      tag: "Meta Description",
      content: "-",
      status: "missing",
      feedback: "Meta description is missing",
      deduction: 20
    });
    breakdown.push({
      tag: "Meta Description",
      issue: "Missing meta description",
      deduction: 20
    });
    score -= 20;
  } else {
    const descLength = description.length;
    if (descLength < 120) {
      tags.push({
        tag: "Meta Description",
        content: sanitizeText(description),
        status: "warning",
        feedback: `Description is too short (${descLength} chars, recommended 150-160)`,
        deduction: 10
      });
      breakdown.push({
        tag: "Meta Description",
        issue: "Description too short",
        deduction: 10
      });
      score -= 10;
    } else if (descLength > 160) {
      tags.push({
        tag: "Meta Description",
        content: sanitizeText(description),
        status: "warning",
        feedback: `Description is too long (${descLength} chars, recommended 150-160)`,
        deduction: 10
      });
      breakdown.push({
        tag: "Meta Description",
        issue: "Description too long",
        deduction: 10
      });
      score -= 10;
    } else {
      tags.push({
        tag: "Meta Description",
        content: sanitizeText(description),
        status: "good",
        feedback: `Perfect length (${descLength} chars)`,
        deduction: 0
      });
    }
  }

  // Meta robots analysis
  const robots = $('meta[name="robots"]').attr('content')?.trim() || '';
  if (!robots) {
    tags.push({
      tag: "Meta Robots",
      content: "-",
      status: "missing",
      feedback: "Meta robots tag is missing",
      deduction: 5
    });
    breakdown.push({
      tag: "Meta Robots",
      issue: "Missing robots tag",
      deduction: 5
    });
    score -= 5;
  } else {
    tags.push({
      tag: "Meta Robots",
      content: sanitizeText(robots),
      status: "good",
      feedback: "Properly configured",
      deduction: 0
    });
  }

  // Open Graph analysis
  const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || '';
  const ogDescription = $('meta[property="og:description"]').attr('content')?.trim() || '';
  const ogImage = $('meta[property="og:image"]').attr('content')?.trim() || '';

  if (!ogTitle) {
    tags.push({
      tag: "OG Title",
      content: "-",
      status: "missing",
      feedback: "Open Graph title is missing",
      deduction: 5
    });
    breakdown.push({
      tag: "Open Graph",
      issue: "Missing OG title",
      deduction: 5
    });
    score -= 5;
  } else {
    tags.push({
      tag: "OG Title",
      content: sanitizeText(ogTitle),
      status: "good",
      feedback: "Present and configured",
      deduction: 0
    });
  }

  if (!ogDescription) {
    tags.push({
      tag: "OG Description",
      content: "-",
      status: "missing",
      feedback: "Open Graph description is missing",
      deduction: 5
    });
    breakdown.push({
      tag: "Open Graph",
      issue: "Missing OG description",
      deduction: 5
    });
    score -= 5;
  } else {
    tags.push({
      tag: "OG Description",
      content: sanitizeText(ogDescription),
      status: "good",
      feedback: "Good content",
      deduction: 0
    });
  }

  if (!ogImage) {
    tags.push({
      tag: "OG Image",
      content: "-",
      status: "missing",
      feedback: "Open Graph image is missing",
      deduction: 5
    });
    breakdown.push({
      tag: "Open Graph",
      issue: "Missing OG image",
      deduction: 5
    });
    score -= 5;
  } else {
    tags.push({
      tag: "OG Image",
      content: ogImage,
      status: "good",
      feedback: "Image present",
      deduction: 0
    });
  }

  // Twitter Card analysis
  const twitterCard = $('meta[name="twitter:card"]').attr('content')?.trim() || '';
  const twitterTitle = $('meta[name="twitter:title"]').attr('content')?.trim() || '';
  const twitterDescription = $('meta[name="twitter:description"]').attr('content')?.trim() || '';
  const twitterImage = $('meta[name="twitter:image"]').attr('content')?.trim() || '';

  if (!twitterCard) {
    tags.push({
      tag: "Twitter Card",
      content: "-",
      status: "missing",
      feedback: "Twitter card type is missing",
      deduction: 5
    });
    breakdown.push({
      tag: "Twitter Card",
      issue: "Missing card type",
      deduction: 5
    });
    score -= 5;
  } else {
    tags.push({
      tag: "Twitter Card",
      content: sanitizeText(twitterCard),
      status: "good",
      feedback: "Card type configured",
      deduction: 0
    });
  }

  if (!twitterTitle) {
    tags.push({
      tag: "Twitter Title",
      content: "-",
      status: "missing",
      feedback: "Twitter title is missing",
      deduction: 5
    });
    breakdown.push({
      tag: "Twitter Card",
      issue: "Missing Twitter title",
      deduction: 5
    });
    score -= 5;
  } else {
    tags.push({
      tag: "Twitter Title",
      content: sanitizeText(twitterTitle),
      status: "good",
      feedback: "Present and configured",
      deduction: 0
    });
  }

  if (!twitterDescription) {
    tags.push({
      tag: "Twitter Description",
      content: "-",
      status: "missing",
      feedback: "Twitter description is missing",
      deduction: 5
    });
    breakdown.push({
      tag: "Twitter Card",
      issue: "Missing Twitter description",
      deduction: 5
    });
    score -= 5;
  } else {
    tags.push({
      tag: "Twitter Description",
      content: sanitizeText(twitterDescription),
      status: "good",
      feedback: "Good content",
      deduction: 0
    });
  }

  if (!twitterImage) {
    tags.push({
      tag: "Twitter Image",
      content: "-",
      status: "missing",
      feedback: "Twitter image is missing",
      deduction: 5
    });
    breakdown.push({
      tag: "Twitter Card",
      issue: "Missing Twitter image",
      deduction: 5
    });
    score -= 5;
  } else {
    tags.push({
      tag: "Twitter Image",
      content: twitterImage,
      status: "good",
      feedback: "Image present",
      deduction: 0
    });
  }

  return {
    tags,
    breakdown,
    score: Math.max(0, score)
  };
}

export function registerRoutes(app: Express): Server {
  // API Routes
  app.post('/api/analyze', async (req, res) => {
    try {
      const { url: targetUrl } = seoAnalysisRequestSchema.parse(req.body);

      // Ensure URL has protocol
      const urlToAnalyze = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

      // Fetch the webpage
      const response = await axios.get(urlToAnalyze, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      const $ = cheerio.load(response.data);
      const domain = extractDomain(urlToAnalyze);

      // Analyze SEO tags
      const { tags, breakdown, score } = analyzeSeoTags($, urlToAnalyze);

      // Extract data for social media previews
      const title = $('title').first().text().trim() || '';
      const description = $('meta[name="description"]').attr('content')?.trim() || '';
      const ogTitle = $('meta[property="og:title"]').attr('content')?.trim() || title;
      const ogDescription = $('meta[property="og:description"]').attr('content')?.trim() || description;
      const ogImage = $('meta[property="og:image"]').attr('content')?.trim() || '';
      const twitterTitle = $('meta[name="twitter:title"]').attr('content')?.trim() || ogTitle;
      const twitterDescription = $('meta[name="twitter:description"]').attr('content')?.trim() || ogDescription;
      const twitterImage = $('meta[name="twitter:image"]').attr('content')?.trim() || ogImage;
      const twitterCard = $('meta[name="twitter:card"]').attr('content')?.trim() || 'summary';

      const result: SeoAnalysisResult = {
        url: targetUrl,
        score,
        breakdown,
        tags,
        previews: {
          google: {
            title: sanitizeText(title),
            description: sanitizeText(description),
            url: targetUrl,
          },
          facebook: {
            title: sanitizeText(ogTitle),
            description: sanitizeText(ogDescription),
            image: ogImage,
            domain: domain,
          },
          twitter: {
            title: sanitizeText(twitterTitle),
            description: sanitizeText(twitterDescription),
            image: twitterImage,
            card: twitterCard,
            domain: domain,
          },
          linkedin: {
            title: sanitizeText(ogTitle),
            description: sanitizeText(ogDescription),
            image: ogImage,
            domain: domain,
          },
        },
      };

      res.json(result);
    } catch (error) {
      console.error('SEO analysis error:', error);
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid request body", errors: error.errors });
      }
      const err = error as any;
      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        return res.status(400).json({ message: 'Unable to reach the specified URL. Please check that the URL is correct and accessible.' });
      } else if (err.response?.status === 404) {
        return res.status(400).json({ message: 'The specified page was not found (404 error).' });
      } else if (err.response?.status && err.response.status >= 400) {
        return res.status(400).json({ message: `The server returned an error: ${err.response.status} ${err.response.statusText}` });
      }
      // Fallback for other errors
      return res.status(500).json({ message: 'An error occurred while analyzing the URL. Please try again.' });
    }
  });

  // Add 404 handler for unknown API routes
  app.all('/api/*', (req, res) => {
    res.status(404).json({ message: 'Not found' });
  });

  const httpServer = createServer(app);
  return httpServer;
}
