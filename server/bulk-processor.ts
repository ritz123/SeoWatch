import { EventEmitter } from 'events';
import { storage } from './storage';
import { parseCSVUrls, generateResultsCSV } from './csv-processor';
import { analyzeSeoTags } from './routes';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as path from 'path';
import type { BulkAnalysisJob, BulkAnalysisResult, SeoAnalysisResult } from '@shared/schema';

/**
 * Job queue for processing bulk SEO analysis
 */
export class BulkAnalysisQueue extends EventEmitter {
  private processingJobs = new Set<string>();
  private maxConcurrentUrls = 10;
  private processingTimeout = 30000; // 30 seconds per URL

  constructor() {
    super();
  }

  /**
   * Add a new job to the queue for processing
   * @param jobId Job ID to process
   */
  async processJob(jobId: string): Promise<void> {
    if (this.processingJobs.has(jobId)) {
      console.log(`Job ${jobId} is already being processed`);
      return;
    }

    this.processingJobs.add(jobId);
    this.emit('job-started', jobId);

    try {
      const job = await storage.getBulkJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      // Update job status to processing
      await storage.updateBulkJob(jobId, {
        status: 'processing',
        processedUrls: 0
      });

      // Parse URLs from uploaded CSV
      const uploadPath = path.join(process.cwd(), 'uploads', `${jobId}.csv`);
      const urls = await parseCSVUrls(uploadPath);

      console.log(`Processing ${urls.length} URLs for job ${jobId}`);

      // Process URLs in batches
      const results: BulkAnalysisResult[] = [];
      const batchSize = this.maxConcurrentUrls;
      
      for (let i = 0; i < urls.length; i += batchSize) {
        const batch = urls.slice(i, i + batchSize);
        const batchPromises = batch.map(url => this.processUrl(url, jobId));
        
        const batchResults = await Promise.allSettled(batchPromises);
        
        for (let j = 0; j < batchResults.length; j++) {
          const result = batchResults[j];
          const url = batch[j];
          
          if (result.status === 'fulfilled') {
            results.push(result.value);
          } else {
            // Handle failed URL
            const errorResult: BulkAnalysisResult = {
              url,
              seoScore: 0,
              titleTag: '',
              titleLength: 0,
              metaDescription: '',
              metaDescriptionLength: 0,
              h1Tag: '',
              ogTitle: '',
              ogDescription: '',
              ogImage: '',
              twitterTitle: '',
              twitterDescription: '',
              twitterCard: '',
              robotsTag: '',
              canonicalUrl: '',
              analysisDate: new Date().toISOString(),
              errorMessage: result.reason?.message || 'Analysis failed'
            };
            results.push(errorResult);
          }

          // Update progress
          const processedCount = i + j + 1;
          await storage.updateBulkJob(jobId, {
            processedUrls: processedCount
          });

          this.emit('job-progress', jobId, {
            total: urls.length,
            processed: processedCount,
            percentage: Math.round((processedCount / urls.length) * 100)
          });
        }
      }

      // Generate CSV file with results
      const resultPath = path.join(process.cwd(), 'results', `${jobId}_results.csv`);
      await generateResultsCSV(results, resultPath);

      // Update job as completed
      await storage.updateBulkJob(jobId, {
        status: 'completed',
        completedAt: new Date().toISOString(),
        resultFilePath: resultPath
      });

      this.emit('job-completed', jobId);
      console.log(`Job ${jobId} completed successfully`);

    } catch (error) {
      console.error(`Job ${jobId} failed:`, error);
      
      await storage.updateBulkJob(jobId, {
        status: 'failed',
        completedAt: new Date().toISOString()
      });

      this.emit('job-failed', jobId, error);
    } finally {
      this.processingJobs.delete(jobId);
    }
  }

  /**
   * Process a single URL and return SEO analysis result
   * @param url URL to analyze
   * @param jobId Job ID for tracking
   * @returns SEO analysis result in CSV format
   */
  private async processUrl(url: string, jobId: string): Promise<BulkAnalysisResult> {
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('URL analysis timeout')), this.processingTimeout);
    });

    const analysisPromise = this.performSeoAnalysis(url);
    
    try {
      const analysis = await Promise.race([analysisPromise, timeoutPromise]);
      
      // Convert full analysis to CSV format
      const csvResult: BulkAnalysisResult = {
        url: analysis.url,
        seoScore: analysis.score,
        titleTag: this.extractTagContent(analysis.tags, 'Title'),
        titleLength: this.extractTagContent(analysis.tags, 'Title').length,
        metaDescription: this.extractTagContent(analysis.tags, 'Meta Description'),
        metaDescriptionLength: this.extractTagContent(analysis.tags, 'Meta Description').length,
        h1Tag: this.extractTagContent(analysis.tags, 'H1'),
        ogTitle: analysis.previews.facebook.title,
        ogDescription: analysis.previews.facebook.description,
        ogImage: analysis.previews.facebook.image || '',
        twitterTitle: analysis.previews.twitter.title,
        twitterDescription: analysis.previews.twitter.description,
        twitterCard: analysis.previews.twitter.card,
        robotsTag: this.extractTagContent(analysis.tags, 'Robots'),
        canonicalUrl: this.extractTagContent(analysis.tags, 'Canonical'),
        analysisDate: new Date().toISOString()
      };

      // Store individual result
      await storage.createBulkUrlResult({
        jobId,
        url,
        analysisResult: analysis
      });

      return csvResult;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Store failed result
      await storage.createBulkUrlResult({
        jobId,
        url,
        errorMessage
      });

      throw new Error(`Failed to analyze ${url}: ${errorMessage}`);
    }
  }

  /**
   * Perform SEO analysis for a single URL (reusing existing logic)
   * @param targetUrl URL to analyze
   * @returns SEO analysis result
   */
  private async performSeoAnalysis(targetUrl: string): Promise<SeoAnalysisResult> {
    // Ensure URL has protocol
    const urlToAnalyze = targetUrl.startsWith('http') ? targetUrl : `https://${targetUrl}`;

    // Fetch the webpage
    const response = await axios.get(urlToAnalyze, {
      timeout: 15000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Reuse existing analysis logic from routes.ts
    const { tags, breakdown, score } = analyzeSeoTags($, urlToAnalyze);

    // Extract preview data
    const title = $('title').first().text().trim() || '';
    const description = $('meta[name="description"]').attr('content')?.trim() || '';
    const domain = new URL(urlToAnalyze).hostname;

    const result: SeoAnalysisResult = {
      url: targetUrl,
      score,
      breakdown,
      tags,
      previews: {
        google: {
          title: this.sanitizeText(title),
          description: this.sanitizeText(description),
          url: targetUrl
        },
        facebook: {
          title: this.sanitizeText($('meta[property="og:title"]').attr('content') || title),
          description: this.sanitizeText($('meta[property="og:description"]').attr('content') || description),
          image: $('meta[property="og:image"]').attr('content') || '',
          domain
        },
        twitter: {
          title: this.sanitizeText($('meta[name="twitter:title"]').attr('content') || title),
          description: this.sanitizeText($('meta[name="twitter:description"]').attr('content') || description),
          image: $('meta[name="twitter:image"]').attr('content') || '',
          card: $('meta[name="twitter:card"]').attr('content') || 'summary',
          domain
        },
        linkedin: {
          title: this.sanitizeText($('meta[property="og:title"]').attr('content') || title),
          description: this.sanitizeText($('meta[property="og:description"]').attr('content') || description),
          image: $('meta[property="og:image"]').attr('content') || '',
          domain
        }
      }
    };

    return result;
  }

  /**
   * Extract tag content from SEO tags array
   * @param tags Array of SEO tags
   * @param tagName Name of the tag to find
   * @returns Tag content or empty string
   */
  private extractTagContent(tags: any[], tagName: string): string {
    const tag = tags.find(t => t.tag === tagName);
    return tag ? tag.content : '';
  }

  /**
   * Sanitize text content
   * @param text Text to sanitize
   * @returns Sanitized text
   */
  private sanitizeText(text: string): string {
    return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
               .replace(/<[^>]*>/g, '')
               .trim();
  }

  /**
   * Get current processing status
   */
  getProcessingJobs(): string[] {
    return Array.from(this.processingJobs);
  }

  /**
   * Check if a job is currently being processed
   * @param jobId Job ID to check
   */
  isProcessing(jobId: string): boolean {
    return this.processingJobs.has(jobId);
  }
}

// Export singleton instance
export const bulkAnalysisQueue = new BulkAnalysisQueue();
