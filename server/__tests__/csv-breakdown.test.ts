import { describe, it, expect, beforeAll, afterEach } from '@jest/globals';
import { generateResultsCSV } from '../csv-processor';
import * as fs from 'fs';
import * as path from 'path';
import type { BulkAnalysisResult } from '@shared/schema';

describe('CSV Score Breakdown Feature', () => {
  const testResultsPath = '/tmp/test-breakdown-results.csv';

  beforeAll(() => {
    // Ensure results directory exists
    if (!fs.existsSync(path.dirname(testResultsPath))) {
      fs.mkdirSync(path.dirname(testResultsPath), { recursive: true });
    }
  });

  afterEach(() => {
    // Clean up test files
    if (fs.existsSync(testResultsPath)) {
      fs.unlinkSync(testResultsPath);
    }
  });

  it('should include score breakdown columns in CSV header', async () => {
    const testResults: BulkAnalysisResult[] = [];
    await generateResultsCSV(testResults, testResultsPath);

    const csvContent = fs.readFileSync(testResultsPath, 'utf-8');
    const header = csvContent.split('\n')[0];

    expect(header).toContain('Score_Breakdown_Summary');
    expect(header).toContain('Breakdown_Details');
  });

  it('should include score breakdown data in CSV output', async () => {
    const testResults: BulkAnalysisResult[] = [
      {
        url: 'https://example.com',
        seoScore: 85,
        titleTag: 'Example Page Title',
        titleLength: 18,
        metaDescription: 'This is an example meta description.',
        metaDescriptionLength: 40,
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
      }
    ];

    await generateResultsCSV(testResults, testResultsPath);

    const csvContent = fs.readFileSync(testResultsPath, 'utf-8');
    const lines = csvContent.split('\n').filter(line => line.trim());

    // Check that breakdown data is included
    const dataRow = lines[1];
    expect(dataRow).toContain('Title: Title too short (-10pts)');
    expect(dataRow).toContain('Meta Description: Description too short (-5pts)');
    // Fix the JSON escaping expectation - CSV properly escapes quotes
    expect(dataRow).toContain('""tag"":""Title""');
    expect(dataRow).toContain('""deduction"":10');
  });

  it('should handle perfect score with no issues', async () => {
    const testResults: BulkAnalysisResult[] = [
      {
        url: 'https://perfect-example.com',
        seoScore: 100,
        titleTag: 'Perfect SEO Page Title That Is Just Right Length',
        titleLength: 46,
        metaDescription: 'This is a perfect meta description that falls within the recommended character count.',
        metaDescriptionLength: 95,
        h1Tag: 'Perfect Main Heading',
        ogTitle: 'Perfect SEO Page Title',
        ogDescription: 'Perfect OG description',
        ogImage: 'https://perfect-example.com/image.jpg',
        twitterTitle: 'Perfect SEO Page Title',
        twitterDescription: 'Perfect Twitter description',
        twitterCard: 'summary',
        robotsTag: 'index, follow',
        canonicalUrl: 'https://perfect-example.com',
        analysisDate: '2024-01-01T00:00:00.000Z',
        scoreBreakdown: [],
        breakdownSummary: 'No issues found'
      }
    ];

    await generateResultsCSV(testResults, testResultsPath);

    const csvContent = fs.readFileSync(testResultsPath, 'utf-8');
    const dataRow = csvContent.split('\n')[1];

    expect(dataRow).toContain('No issues found');
    expect(dataRow).toContain('[]'); // Empty breakdown array
  });

  it('should handle error cases with empty breakdown', async () => {
    const testResults: BulkAnalysisResult[] = [
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

    await generateResultsCSV(testResults, testResultsPath);

    const csvContent = fs.readFileSync(testResultsPath, 'utf-8');
    const dataRow = csvContent.split('\n')[1];

    expect(dataRow).toContain('Failed to fetch page');
    expect(dataRow).toContain('[]'); // Empty breakdown array
  });
});
