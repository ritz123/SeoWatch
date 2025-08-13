import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { stringify } from 'csv-stringify';
import type { BulkAnalysisResult } from '@shared/schema';

/**
 * Parse CSV file and extract URLs
 * @param filePath Path to the CSV file
 * @returns Array of URLs found in the CSV
 */
export async function parseCSVUrls(filePath: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const urls: string[] = [];
    const stream = fs.createReadStream(filePath);
    
    stream
      .pipe(parse({ 
        columns: true, 
        skip_empty_lines: true,
        trim: true 
      }))
      .on('data', (row: Record<string, string>) => {
        // Look for URL in common column names
        const urlColumns = ['url', 'URL', 'website', 'link', 'domain', 'site'];
        let foundUrl = '';
        
        for (const col of urlColumns) {
          if (row[col] && row[col].trim()) {
            foundUrl = row[col].trim();
            break;
          }
        }
        
        // If no standard column found, use the first column that looks like a URL
        if (!foundUrl) {
          for (const value of Object.values(row)) {
            if (value && (value.includes('http') || value.includes('www.') || value.includes('.'))) {
              foundUrl = value.trim();
              break;
            }
          }
        }
        
        if (foundUrl) {
          // Ensure URL has protocol
          if (!foundUrl.startsWith('http://') && !foundUrl.startsWith('https://')) {
            foundUrl = `https://${foundUrl}`;
          }
          urls.push(foundUrl);
        }
      })
      .on('end', () => {
        resolve(urls);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

/**
 * Generate CSV file from bulk analysis results
 * @param results Array of analysis results
 * @param outputPath Path where to save the CSV file
 */
export async function generateResultsCSV(results: BulkAnalysisResult[], outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const columns = [
      'URL',
      'SEO_Score',
      'Title_Tag',
      'Title_Length',
      'Meta_Description',
      'Meta_Description_Length',
      'H1_Tag',
      'OG_Title',
      'OG_Description',
      'OG_Image',
      'Twitter_Title',
      'Twitter_Description',
      'Twitter_Card',
      'Robots_Tag',
      'Canonical_URL',
      'Analysis_Date',
      'Score_Breakdown_Summary',
      'Breakdown_Details',
      'Error_Message'
    ];

    const csvData = results.map(result => [
      result.url,
      result.seoScore,
      result.titleTag,
      result.titleLength,
      result.metaDescription,
      result.metaDescriptionLength,
      result.h1Tag,
      result.ogTitle,
      result.ogDescription,
      result.ogImage,
      result.twitterTitle,
      result.twitterDescription,
      result.twitterCard,
      result.robotsTag,
      result.canonicalUrl,
      result.analysisDate,
      result.breakdownSummary,
      result.scoreBreakdown ? JSON.stringify(result.scoreBreakdown) : '',
      result.errorMessage || ''
    ]);

    stringify([columns, ...csvData], (err, output) => {
      if (err) {
        reject(err);
      } else {
        fs.writeFile(outputPath, output, (writeErr) => {
          if (writeErr) {
            reject(writeErr);
          } else {
            resolve();
          }
        });
      }
    });
  });
}

/**
 * Validate CSV file format and size
 * @param filePath Path to the CSV file
 * @param maxSizeBytes Maximum file size in bytes (default 10MB)
 * @returns Validation result
 */
export async function validateCSVFile(filePath: string, maxSizeBytes: number = 10 * 1024 * 1024): Promise<{
  valid: boolean;
  error?: string;
  urlCount?: number;
}> {
  try {
    // Check file size
    const stats = await fs.promises.stat(filePath);
    if (stats.size > maxSizeBytes) {
      return {
        valid: false,
        error: `File size ${(stats.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of ${maxSizeBytes / 1024 / 1024}MB`
      };
    }

    // Check if file is actually CSV by parsing first few lines
    const urls = await parseCSVUrls(filePath);
    
    if (urls.length === 0) {
      return {
        valid: false,
        error: 'No valid URLs found in CSV file. Please ensure your CSV has a column with URLs.'
      };
    }

    if (urls.length > 1000) {
      return {
        valid: false,
        error: `CSV contains ${urls.length} URLs. Maximum allowed is 1000 URLs per batch.`
      };
    }

    return {
      valid: true,
      urlCount: urls.length
    };
  } catch (error) {
    return {
      valid: false,
      error: `Invalid CSV file: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Clean up temporary files
 * @param filePath Path to file to delete
 */
export async function cleanupFile(filePath: string): Promise<void> {
  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    console.error(`Failed to cleanup file ${filePath}:`, error);
  }
}

/**
 * Ensure uploads directory exists
 * @param dirPath Directory path to create
 */
export async function ensureUploadDir(dirPath: string): Promise<void> {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true });
  } catch (error) {
    console.error(`Failed to create upload directory ${dirPath}:`, error);
    throw error;
  }
}
