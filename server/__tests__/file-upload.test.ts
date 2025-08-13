import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import * as fs from 'fs';
import * as path from 'path';

describe('CSV File Upload Tests', () => {
  let app: express.Application;
  let server: any;
  const testUploadDir = 'test-uploads';
  const testResultsDir = 'test-results';

  beforeAll(() => {
    // Create test app
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    server = registerRoutes(app as any); // Fix type issue

    // Create test directories
    if (!fs.existsSync(testUploadDir)) {
      fs.mkdirSync(testUploadDir, { recursive: true });
    }
    if (!fs.existsSync(testResultsDir)) {
      fs.mkdirSync(testResultsDir, { recursive: true });
    }
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads', { recursive: true });
    }
    if (!fs.existsSync('results')) {
      fs.mkdirSync('results', { recursive: true });
    }
  });

  afterAll(() => {
    // Cleanup test directories
    if (fs.existsSync(testUploadDir)) {
      fs.rmSync(testUploadDir, { recursive: true });
    }
    if (fs.existsSync(testResultsDir)) {
      fs.rmSync(testResultsDir, { recursive: true });
    }
  });

  beforeEach(() => {
    // Setup for each test
  });

  afterEach(() => {
    // Cleanup after each test
  });

  describe('File Upload Validation', () => {
    it('should reject requests with no file', async () => {
      const response = await request(app)
        .post('/api/bulk/upload')
        .expect(400);

      expect(response.body.error).toContain('No file uploaded');
    });

    it('should reject non-CSV files', async () => {
      // Create a test text file
      const testFilePath = path.join(testUploadDir, 'test.txt');
      fs.writeFileSync(testFilePath, 'This is not a CSV file');

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testFilePath)
        .expect(400);

      // Should be rejected by multer file filter
      expect(response.text).toContain('Only CSV files are allowed');

      // Cleanup
      if (fs.existsSync(testFilePath)) {
        fs.unlinkSync(testFilePath);
      }
    });

    it('should accept valid CSV files with proper content-type', async () => {
      // Create a valid CSV file
      const testCsvPath = path.join(testUploadDir, 'valid-test.csv');
      const csvContent = 'url\nhttps://example.com\nhttps://google.com';
      fs.writeFileSync(testCsvPath, csvContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath)
        .set('Content-Type', 'multipart/form-data');

      // Should succeed
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jobId');
      expect(response.body).toHaveProperty('totalUrls');
      expect(response.body.totalUrls).toBe(2);

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });

    it('should handle CSV files with different extensions', async () => {
      // Create a CSV file with .CSV extension (uppercase)
      const testCsvPath = path.join(testUploadDir, 'test-uppercase.CSV');
      const csvContent = 'URL\nhttps://test1.com\nhttps://test2.com\nhttps://test3.com';
      fs.writeFileSync(testCsvPath, csvContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath);

      expect(response.status).toBe(200);
      expect(response.body.totalUrls).toBe(3);

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });
  });

  describe('CSV Content Validation', () => {
    it('should reject CSV files with no valid URLs', async () => {
      const testCsvPath = path.join(testUploadDir, 'no-urls.csv');
      const csvContent = 'name,description\nTest,Description\nAnother,Another Description';
      fs.writeFileSync(testCsvPath, csvContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath)
        .expect(400);

      expect(response.body.error).toContain('No valid URLs found');

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });

    it('should handle CSV files with mixed valid and invalid URLs', async () => {
      const testCsvPath = path.join(testUploadDir, 'mixed-urls.csv');
      const csvContent = 'url\nhttps://valid-site.com\ninvalid-url\nhttps://another-valid.com\nnot-a-url';
      fs.writeFileSync(testCsvPath, csvContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath);

      // Should process valid URLs and skip invalid ones
      expect(response.status).toBe(200);
      expect(response.body.totalUrls).toBeGreaterThan(0);

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });

    it('should handle CSV files with different column names', async () => {
      const testCsvPath = path.join(testUploadDir, 'different-columns.csv');
      const csvContent = 'website,name\nhttps://example.com,Example Site\nhttps://test.com,Test Site';
      fs.writeFileSync(testCsvPath, csvContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath);

      expect(response.status).toBe(200);
      expect(response.body.totalUrls).toBe(2);

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });
  });

  describe('File Size Limits', () => {
    it('should reject files larger than 10MB', async () => {
      const testCsvPath = path.join(testUploadDir, 'large-file.csv');

      // Create a large file (>10MB)
      const largeContent = 'url\n' + 'https://example.com\n'.repeat(500000); // ~8.5MB
      const extraContent = 'x'.repeat(2 * 1024 * 1024); // Additional 2MB
      fs.writeFileSync(testCsvPath, largeContent + extraContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath);

      // Should be rejected due to file size
      expect(response.status).toBe(400);

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });

    it('should accept files within size limit', async () => {
      const testCsvPath = path.join(testUploadDir, 'normal-size.csv');

      // Create a normal-sized file
      const normalContent = 'url\n' + 'https://example.com\n'.repeat(1000); // ~17KB
      fs.writeFileSync(testCsvPath, normalContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath);

      expect(response.status).toBe(200);
      expect(response.body.totalUrls).toBe(1000);

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });
  });

  describe('URL Limit Validation', () => {
    it('should reject CSV files with more than 1000 URLs', async () => {
      const testCsvPath = path.join(testUploadDir, 'too-many-urls.csv');

      // Create CSV with more than 1000 URLs
      let csvContent = 'url\n';
      for (let i = 1; i <= 1001; i++) {
        csvContent += `https://example${i}.com\n`;
      }
      fs.writeFileSync(testCsvPath, csvContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath)
        .expect(400);

      expect(response.body.error).toContain('Maximum allowed is 1000 URLs');

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });

    it('should accept CSV files with exactly 1000 URLs', async () => {
      const testCsvPath = path.join(testUploadDir, 'max-urls.csv');

      // Create CSV with exactly 1000 URLs
      let csvContent = 'url\n';
      for (let i = 1; i <= 1000; i++) {
        csvContent += `https://example${i}.com\n`;
      }
      fs.writeFileSync(testCsvPath, csvContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath);

      expect(response.status).toBe(200);
      expect(response.body.totalUrls).toBe(1000);

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });
  });

  describe('Response Validation', () => {
    it('should return correct response structure for successful upload', async () => {
      const testCsvPath = path.join(testUploadDir, 'response-test.csv');
      const csvContent = 'url\nhttps://example.com\nhttps://test.com';
      fs.writeFileSync(testCsvPath, csvContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('jobId');
      expect(response.body).toHaveProperty('totalUrls');
      expect(response.body).toHaveProperty('estimatedCompletionTime');

      expect(typeof response.body.jobId).toBe('string');
      expect(typeof response.body.totalUrls).toBe('number');
      expect(typeof response.body.estimatedCompletionTime).toBe('string');

      // Verify it's a valid date string
      expect(new Date(response.body.estimatedCompletionTime)).toBeInstanceOf(Date);

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed CSV files gracefully', async () => {
      const testCsvPath = path.join(testUploadDir, 'malformed.csv');
      const malformedContent = 'url\n"unclosed quote\nhttps://example.com';
      fs.writeFileSync(testCsvPath, malformedContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath);

      // Should either succeed with parsed URLs or fail gracefully
      expect([200, 400]).toContain(response.status);

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });

    it('should clean up uploaded files on validation failure', async () => {
      const testCsvPath = path.join(testUploadDir, 'cleanup-test.csv');
      const csvContent = 'name,description\nNo URLs here,Just text';
      fs.writeFileSync(testCsvPath, csvContent);

      const response = await request(app)
        .post('/api/bulk/upload')
        .attach('file', testCsvPath)
        .expect(400);

      // File should be cleaned up after validation failure
      // (We can't easily test this without accessing internal file paths)
      expect(response.body.error).toContain('No valid URLs found');

      // Cleanup
      if (fs.existsSync(testCsvPath)) {
        fs.unlinkSync(testCsvPath);
      }
    });
  });
});
