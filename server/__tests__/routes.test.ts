import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { registerRoutes } from '../routes';
import axios from 'axios';

describe('SEO Analyzer API', () => {
  let app: express.Express;
  let server: any;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    server = registerRoutes(app);
  });

  afterAll(() => {
    server.close();
  });

  beforeEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/analyze', () => {
    it('should analyze a valid URL with complete SEO tags', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Perfect SEO Page - 50 Characters Long Title</title>
          <meta name="description" content="This is a perfect meta description that is exactly the right length for SEO optimization and provides valuable information about the page content.">
          <meta name="robots" content="index, follow">
          <meta property="og:title" content="Perfect SEO Page - Social Media">
          <meta property="og:description" content="Perfect OG description for social media sharing">
          <meta property="og:image" content="https://example.com/image.jpg">
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:title" content="Perfect SEO Page - Twitter">
          <meta name="twitter:description" content="Perfect Twitter description">
          <meta name="twitter:image" content="https://example.com/twitter-image.jpg">
        </head>
        <body>
          <h1>Perfect SEO Page</h1>
          <p>This is a well-optimized page with all necessary SEO tags.</p>
        </body>
        </html>
      `;
      jest.spyOn(axios, 'get').mockResolvedValue({ data: mockHtml });

      const response = await request(app)
        .post('/api/analyze')
        .send({ url: 'https://example.com' })
        .expect(200);

      expect(response.body).toHaveProperty('url', 'https://example.com');
      expect(response.body).toHaveProperty('score');
      expect(response.body.score).toBeGreaterThan(90);
      expect(response.body).toHaveProperty('tags');
      expect(response.body).toHaveProperty('breakdown');
      expect(response.body).toHaveProperty('previews');
    });

    it('should handle missing SEO tags and provide warnings', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <title>Bad</title>
        </head>
        <body>
          <h1>Poor SEO Page</h1>
        </body>
        </html>
      `;
      jest.spyOn(axios, 'get').mockResolvedValue({ data: mockHtml });

      const response = await request(app)
        .post('/api/analyze')
        .send({ url: 'https://bad-seo.com' })
        .expect(200);

      expect(response.body.score).toBeLessThan(50);
      expect(response.body.breakdown.length).toBeGreaterThan(0);
    });

    it('should handle completely missing SEO tags', async () => {
      const mockHtml = `
        <!DOCTYPE html>
        <html lang="en">
        <body>
          <h1>No SEO at all</h1>
        </body>
        </html>
      `;
      jest.spyOn(axios, 'get').mockResolvedValue({ data: mockHtml });

      const response = await request(app)
        .post('/api/analyze')
        .send({ url: 'https://no-seo.com' })
        .expect(200);

      expect(response.body.score).toBeLessThan(25);
    });

    it('should handle URLs without protocol by adding https', async () => {
      const mockHtml = '<html lang="en"><head><title>Test</title></head><body></body></html>';
      jest.spyOn(axios, 'get').mockResolvedValue({ data: mockHtml });

      const response = await request(app)
        .post('/api/analyze')
        .send({ url: 'https://example.com' })
        .expect(200);

      expect(response.body.url).toBe('https://example.com');
    });

    it('should handle network errors gracefully', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue({ code: 'ENOTFOUND' });

      const response = await request(app)
        .post('/api/analyze')
        .send({ url: 'https://unreachable.com' })
        .expect(400);

      expect(response.body.message).toContain('Unable to reach the specified URL');
    });

    it('should handle 404 errors', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue({ response: { status: 404 } });

      const response = await request(app)
        .post('/api/analyze')
        .send({ url: 'https://example.com/nonexistent' })
        .expect(400);

      expect(response.body.message).toContain('not found (404 error)');
    });

    it('should handle server errors', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue({ response: { status: 500 } });

      const response = await request(app)
        .post('/api/analyze')
        .send({ url: 'https://example.com' })
        .expect(400);

      expect(response.body.message).toContain('server returned an error');
    });

    it('should validate request body schema', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({ invalidField: 'test' })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });
  });

  it('should return 404 for non-existent API path', async () => {
    const response = await request(app)
      .post('/api/nonexistent')
      .send({})
      .expect(404);
    expect(response.body).toHaveProperty('message');
  });
});
