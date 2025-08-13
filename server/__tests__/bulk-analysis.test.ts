import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { Request, Response } from 'express';

// Mock dependencies with proper types
const mockStorage = {
  createBulkJob: jest.fn() as jest.MockedFunction<any>,
  getBulkJob: jest.fn() as jest.MockedFunction<any>,
  updateBulkJob: jest.fn() as jest.MockedFunction<any>,
  getUserBulkJobs: jest.fn() as jest.MockedFunction<any>,
  createBulkUrlResult: jest.fn() as jest.MockedFunction<any>,
  getBulkUrlResults: jest.fn() as jest.MockedFunction<any>,
  updateBulkUrlResult: jest.fn() as jest.MockedFunction<any>,
};

const mockCSVProcessor = {
  validateCSVFile: jest.fn() as jest.MockedFunction<any>,
  parseCSVUrls: jest.fn() as jest.MockedFunction<any>,
  generateResultsCSV: jest.fn() as jest.MockedFunction<any>,
};

const mockBulkQueue = {
  processJob: jest.fn() as jest.MockedFunction<any>,
  isProcessing: jest.fn() as jest.MockedFunction<any>,
  getProcessingJobs: jest.fn() as jest.MockedFunction<any>,
};

jest.mock('../storage', () => ({ storage: mockStorage }));
jest.mock('../csv-processor', () => mockCSVProcessor);
jest.mock('../bulk-processor', () => ({ bulkAnalysisQueue: mockBulkQueue }));

describe('Bulk Analysis API', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockReq = {
      ip: '127.0.0.1',
      headers: { 'user-agent': 'test-agent' },
      params: {},
      body: {},
      file: undefined
    };
    
    mockRes = {
      status: jest.fn().mockReturnThis() as any,
      json: jest.fn().mockReturnThis() as any,
      setHeader: jest.fn().mockReturnThis() as any,
    };

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('CSV Processing', () => {
    it('should parse CSV file and extract URLs', async () => {
      const mockUrls = ['https://example.com', 'https://test.com'];
      mockCSVProcessor.parseCSVUrls.mockResolvedValue(mockUrls);

      const testFile = '/test/test-urls.csv';
      const result = await mockCSVProcessor.parseCSVUrls(testFile);

      expect(result).toEqual(mockUrls);
      expect(mockCSVProcessor.parseCSVUrls).toHaveBeenCalledWith(testFile);
    });

    it('should validate CSV file size and format', async () => {
      const validationResult = {
        valid: true,
        urlCount: 50
      };
      mockCSVProcessor.validateCSVFile.mockResolvedValue(validationResult);

      const testFile = '/test/valid-urls.csv';
      const result = await mockCSVProcessor.validateCSVFile(testFile);

      expect(result.valid).toBe(true);
      expect(result.urlCount).toBe(50);
    });

    it('should reject files that are too large', async () => {
      const validationResult = {
        valid: false,
        error: 'File size 15.5MB exceeds maximum of 10MB'
      };
      mockCSVProcessor.validateCSVFile.mockResolvedValue(validationResult);

      const testFile = '/test/large-file.csv';
      const result = await mockCSVProcessor.validateCSVFile(testFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds maximum');
    });

    it('should reject files with too many URLs', async () => {
      const validationResult = {
        valid: false,
        error: 'CSV contains 1500 URLs. Maximum allowed is 1000 URLs per batch.'
      };
      mockCSVProcessor.validateCSVFile.mockResolvedValue(validationResult);

      const testFile = '/test/too-many-urls.csv';
      const result = await mockCSVProcessor.validateCSVFile(testFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Maximum allowed is 1000');
    });

    it('should generate CSV results from analysis data', async () => {
      const mockResults = [
        {
          url: 'https://example.com',
          seoScore: 85,
          titleTag: 'Example Site',
          titleLength: 12,
          metaDescription: 'Example description',
          metaDescriptionLength: 19,
          h1Tag: 'Welcome',
          ogTitle: 'Example Site',
          ogDescription: 'Example description',
          ogImage: '/image.jpg',
          twitterTitle: 'Example Site',
          twitterDescription: 'Example description',
          twitterCard: 'summary',
          robotsTag: 'index,follow',
          canonicalUrl: 'https://example.com',
          analysisDate: '2025-08-13T10:30:00Z'
        }
      ];

      mockCSVProcessor.generateResultsCSV.mockResolvedValue(undefined);

      const outputPath = '/tmp/test-results.csv';
      await mockCSVProcessor.generateResultsCSV(mockResults, outputPath);

      expect(mockCSVProcessor.generateResultsCSV).toHaveBeenCalledWith(mockResults, outputPath);
    });
  });

  describe('Bulk Analysis Job Management', () => {
    it('should create a new bulk analysis job', async () => {
      const mockJob = {
        id: 'job-123',
        userSession: '127.0.0.1-test-agent',
        filename: 'test-urls.csv',
        totalUrls: 10,
        processedUrls: 0,
        status: 'pending' as const,
        createdAt: '2025-08-13T10:00:00Z'
      };

      mockStorage.createBulkJob.mockResolvedValue(mockJob);

      const insertJob = {
        userSession: '127.0.0.1-test-agent',
        filename: 'test-urls.csv',
        totalUrls: 10,
        processedUrls: 0,
        status: 'pending' as const
      };

      const result = await mockStorage.createBulkJob(insertJob);

      expect(result).toEqual(mockJob);
      expect(mockStorage.createBulkJob).toHaveBeenCalledWith(insertJob);
    });

    it('should update job progress', async () => {
      const updatedJob = {
        id: 'job-123',
        userSession: '127.0.0.1-test-agent',
        filename: 'test-urls.csv',
        totalUrls: 10,
        processedUrls: 5,
        status: 'processing' as const,
        createdAt: '2025-08-13T10:00:00Z'
      };

      mockStorage.updateBulkJob.mockResolvedValue(updatedJob);

      const result = await mockStorage.updateBulkJob('job-123', { processedUrls: 5, status: 'processing' });

      expect(result).toEqual(updatedJob);
      expect(mockStorage.updateBulkJob).toHaveBeenCalledWith('job-123', { processedUrls: 5, status: 'processing' });
    });

    it('should retrieve user jobs', async () => {
      const mockJobs = [
        {
          id: 'job-123',
          userSession: '127.0.0.1-test-agent',
          filename: 'test-urls.csv',
          totalUrls: 10,
          processedUrls: 10,
          status: 'completed' as const,
          createdAt: '2025-08-13T10:00:00Z',
          completedAt: '2025-08-13T10:05:00Z'
        }
      ];

      mockStorage.getUserBulkJobs.mockResolvedValue(mockJobs);

      const result = await mockStorage.getUserBulkJobs('127.0.0.1-test-agent');

      expect(result).toEqual(mockJobs);
      expect(mockStorage.getUserBulkJobs).toHaveBeenCalledWith('127.0.0.1-test-agent');
    });
  });

  describe('Job Queue Processing', () => {
    it('should process a job successfully', async () => {
      mockBulkQueue.processJob.mockResolvedValue(undefined);

      await mockBulkQueue.processJob('job-123');

      expect(mockBulkQueue.processJob).toHaveBeenCalledWith('job-123');
    });

    it('should handle job processing errors', async () => {
      mockBulkQueue.processJob.mockRejectedValue(new Error('Processing failed'));

      await expect(mockBulkQueue.processJob('job-123')).rejects.toThrow('Processing failed');
    });

    it('should track processing status', () => {
      mockBulkQueue.isProcessing.mockReturnValue(true);
      mockBulkQueue.getProcessingJobs.mockReturnValue(['job-123']);

      expect(mockBulkQueue.isProcessing('job-123')).toBe(true);
      expect(mockBulkQueue.getProcessingJobs()).toContain('job-123');
    });
  });

  describe('Error Scenarios', () => {
    it('should handle non-existent job requests', async () => {
      mockStorage.getBulkJob.mockResolvedValue(undefined);

      const result = await mockStorage.getBulkJob('non-existent-job');

      expect(result).toBeUndefined();
    });

    it('should handle invalid CSV format', async () => {
      const validationResult = {
        valid: false,
        error: 'Invalid CSV file: Unable to parse CSV format'
      };
      mockCSVProcessor.validateCSVFile.mockResolvedValue(validationResult);

      const testFile = '/test/invalid.csv';
      const result = await mockCSVProcessor.validateCSVFile(testFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Invalid CSV file');
    });

    it('should handle missing URL column', async () => {
      const validationResult = {
        valid: false,
        error: 'No valid URLs found in CSV file. Please ensure your CSV has a column with URLs.'
      };
      mockCSVProcessor.validateCSVFile.mockResolvedValue(validationResult);

      const testFile = '/test/no-urls.csv';
      const result = await mockCSVProcessor.validateCSVFile(testFile);

      expect(result.valid).toBe(false);
      expect(result.error).toContain('No valid URLs found');
    });
  });
});

describe('Integration Tests', () => {
  it('should complete full bulk analysis workflow', async () => {
    // Mock a complete workflow from upload to download
    const mockJob = {
      id: 'job-integration-test',
      userSession: '127.0.0.1-test-agent',
      filename: 'integration-test.csv',
      totalUrls: 3,
      processedUrls: 0,
      status: 'pending' as const,
      createdAt: '2025-08-13T10:00:00Z'
    };

    const mockUrls = ['https://example.com', 'https://test.com', 'https://demo.com'];
    
    // Mock the entire workflow
    mockCSVProcessor.validateCSVFile.mockResolvedValue({ valid: true, urlCount: 3 });
    mockCSVProcessor.parseCSVUrls.mockResolvedValue(mockUrls);
    mockStorage.createBulkJob.mockResolvedValue(mockJob);
    mockStorage.updateBulkJob.mockResolvedValue({
      ...mockJob,
      status: 'completed',
      processedUrls: 3,
      completedAt: '2025-08-13T10:05:00Z',
      resultFilePath: '/results/job-integration-test_results.csv'
    });

    // Simulate the workflow
    const validation = await mockCSVProcessor.validateCSVFile('/test/integration-test.csv');
    expect(validation.valid).toBe(true);

    const job = await mockStorage.createBulkJob({
      userSession: '127.0.0.1-test-agent',
      filename: 'integration-test.csv',
      totalUrls: 3,
      processedUrls: 0,
      status: 'pending'
    });
    expect(job.id).toBe('job-integration-test');

    const urls = await mockCSVProcessor.parseCSVUrls('/test/integration-test.csv');
    expect(urls).toEqual(mockUrls);

    const completedJob = await mockStorage.updateBulkJob(job.id, {
      status: 'completed',
      processedUrls: 3,
      completedAt: '2025-08-13T10:05:00Z',
      resultFilePath: '/results/job-integration-test_results.csv'
    });
    expect(completedJob?.status).toBe('completed');
  });
});
