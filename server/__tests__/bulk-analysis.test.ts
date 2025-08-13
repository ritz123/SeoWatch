import { describe, it, expect, beforeEach, afterEach, beforeAll } from '@jest/globals';
import { generateResultsCSV, parseCSVUrls } from '../csv-processor';
import * as fs from 'fs';
import * as path from 'path';
import type { BulkAnalysisResult } from '@shared/schema';

describe('Bulk Analysis Integration Tests', () => {
  const testResultsPath = '/tmp/test-results.csv';

  beforeAll(() => {
    // Ensure results directory exists
    if (!fs.existsSync(path.dirname(testResultsPath))) {
      fs.mkdirSync(path.dirname(testResultsPath), { recursive: true });
    }
  });

  beforeEach(() => {
    // Setup for each test
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testResultsPath)) {
      fs.unlinkSync(testResultsPath);
    }
  });

  describe('CSV Generation with Score Breakdown', () => {
    it('should include score breakdown in CSV output', async () => {
      const testResults: BulkAnalysisResult[] = [
        {
          url: 'https://example.com',
          seoScore: 85,
          titleTag: 'Example Page Title',
          titleLength: 18,
          metaDescription: 'This is an example meta description for testing purposes.',
          metaDescriptionLength: 56,
          h1Tag: 'Main Heading',
          ogTitle: 'Example Page Title',
          ogDescription: 'Example OG description',
          ogImage: 'https://example.com/image.jpg',
          twitterTitle: 'Example Page Title',
          twitterDescription: 'Example Twitter description',
          twitterCard: 'summary_large_image',
          robotsTag: 'index, follow',
          canonicalUrl: 'https://example.com',
          analysisDate: '2024-01-01T00:00:00.000Z',
          scoreBreakdown: [
            {
              tag: 'Title',
              issue: 'Title too short',
              deduction: 10
            },
            {
              tag: 'Meta Description',
              issue: 'Description too short',
              deduction: 5
            }
          ],
          breakdownSummary: 'Title: Title too short (-10pts); Meta Description: Description too short (-5pts)'
        },
        {
          url: 'https://example2.com',
          seoScore: 100,
          titleTag: 'Perfect SEO Page Title That Is Just Right Length',
          titleLength: 46,
          metaDescription: 'This is a perfect meta description that falls within the recommended character count for optimal SEO performance.',
          metaDescriptionLength: 124,
          h1Tag: 'Perfect Main Heading',
          ogTitle: 'Perfect SEO Page Title',
          ogDescription: 'Perfect OG description',
          ogImage: 'https://example2.com/image.jpg',
          twitterTitle: 'Perfect SEO Page Title',
          twitterDescription: 'Perfect Twitter description',
          twitterCard: 'summary',
          robotsTag: 'index, follow',
          canonicalUrl: 'https://example2.com',
          analysisDate: '2024-01-01T00:00:00.000Z',
          scoreBreakdown: [],
          breakdownSummary: 'No issues found'
        }
      ];

      await generateResultsCSV(testResults, testResultsPath);

      // Verify file was created
      expect(fs.existsSync(testResultsPath)).toBe(true);

      // Read and verify CSV content
      const csvContent = fs.readFileSync(testResultsPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());

      // Check header includes breakdown columns
      const header = lines[0];
      expect(header).toContain('Score_Breakdown_Summary');
      expect(header).toContain('Breakdown_Details');

      // Check first result row includes breakdown data
      const firstDataRow = lines[1];
      expect(firstDataRow).toContain('Title: Title too short (-10pts); Meta Description: Description too short (-5pts)');
      expect(firstDataRow).toContain('""tag"":""Title""');

      // Check second result row shows no issues
      const secondDataRow = lines[2];
      expect(secondDataRow).toContain('No issues found');
      expect(secondDataRow).toContain('[]'); // Empty breakdown array
    });

    it('should handle error cases with empty breakdown', async () => {
      const errorResult: BulkAnalysisResult[] = [
        {
          url: 'https://failed-example.com',
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
          analysisDate: '2024-01-01T00:00:00.000Z',
          scoreBreakdown: [],
          breakdownSummary: '',
          errorMessage: 'Failed to fetch page'
        }
      ];

      await generateResultsCSV(errorResult, testResultsPath);

      const csvContent = fs.readFileSync(testResultsPath, 'utf-8');
      const lines = csvContent.split('\n').filter(line => line.trim());

      // Verify error case is handled properly
      const dataRow = lines[1];
      expect(dataRow).toContain('Failed to fetch page');
      expect(dataRow).toContain('[]'); // Empty breakdown array
    });
  });

  describe('CSV Header Validation', () => {
    it('should have all required columns including breakdown fields', async () => {
      const emptyResults: BulkAnalysisResult[] = [];
      await generateResultsCSV(emptyResults, testResultsPath);

      const csvContent = fs.readFileSync(testResultsPath, 'utf-8');
      const header = csvContent.split('\n')[0];

      const expectedColumns = [
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

      expectedColumns.forEach(column => {
        expect(header).toContain(column);
      });
    });
  });
});

describe('Integration Test: CSV Processing', () => {
  const testUploadDir = '/tmp/test-uploads';
  const testCsvPath = path.join(testUploadDir, 'test-urls.csv');

  beforeAll(() => {
    // Create test directories
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }

    // Create test CSV file
    const testCsvContent = 'url\nhttps://example.com\nhttps://google.com';
    fs.writeFileSync(testCsvPath, testCsvContent);
  });

  afterAll(() => {
    // Clean up test files and directories
    if (fs.existsSync(testCsvPath)) {
      fs.unlinkSync(testCsvPath);
    }
    if (fs.existsSync(testUploadDir)) {
      fs.rmdirSync(testUploadDir);
    }
  });

  it('should parse CSV and verify URL extraction', async () => {
    const urls = await parseCSVUrls(testCsvPath);

    expect(urls).toHaveLength(2);
    expect(urls).toContain('https://example.com');
    expect(urls).toContain('https://google.com');
  });
});
