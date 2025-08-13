import { type User, type InsertUser, type BulkAnalysisJob, type BulkUrlResult, type InsertBulkAnalysisJob, type InsertBulkUrlResult } from "@shared/schema";
import { randomUUID } from "crypto";

// Storage interface - extending with bulk analysis methods
export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Bulk Analysis Methods
  createBulkJob(job: InsertBulkAnalysisJob): Promise<BulkAnalysisJob>;
  getBulkJob(jobId: string): Promise<BulkAnalysisJob | undefined>;
  updateBulkJob(jobId: string, updates: Partial<BulkAnalysisJob>): Promise<BulkAnalysisJob | undefined>;
  getUserBulkJobs(userSession: string): Promise<BulkAnalysisJob[]>;
  createBulkUrlResult(result: InsertBulkUrlResult): Promise<BulkUrlResult>;
  getBulkUrlResults(jobId: string): Promise<BulkUrlResult[]>;
  updateBulkUrlResult(id: string, updates: Partial<BulkUrlResult>): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private bulkJobs: Map<string, BulkAnalysisJob>;
  private bulkUrlResults: Map<string, BulkUrlResult>;

  constructor() {
    this.users = new Map();
    this.bulkJobs = new Map();
    this.bulkUrlResults = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Bulk Analysis Methods
  async createBulkJob(insertJob: InsertBulkAnalysisJob): Promise<BulkAnalysisJob> {
    const id = randomUUID();
    const job: BulkAnalysisJob = {
      ...insertJob,
      id,
      createdAt: new Date().toISOString(),
    };
    this.bulkJobs.set(id, job);
    return job;
  }

  async getBulkJob(jobId: string): Promise<BulkAnalysisJob | undefined> {
    return this.bulkJobs.get(jobId);
  }

  async updateBulkJob(jobId: string, updates: Partial<BulkAnalysisJob>): Promise<BulkAnalysisJob | undefined> {
    const job = this.bulkJobs.get(jobId);
    if (!job) return undefined;

    const updatedJob = { ...job, ...updates };
    this.bulkJobs.set(jobId, updatedJob);
    return updatedJob;
  }

  async getUserBulkJobs(userSession: string): Promise<BulkAnalysisJob[]> {
    return Array.from(this.bulkJobs.values())
      .filter(job => job.userSession === userSession)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createBulkUrlResult(insertResult: InsertBulkUrlResult): Promise<BulkUrlResult> {
    const id = randomUUID();
    const result: BulkUrlResult = {
      ...insertResult,
      id,
      processedAt: new Date().toISOString(),
    };
    this.bulkUrlResults.set(id, result);
    return result;
  }

  async getBulkUrlResults(jobId: string): Promise<BulkUrlResult[]> {
    return Array.from(this.bulkUrlResults.values())
      .filter(result => result.jobId === jobId);
  }

  async updateBulkUrlResult(id: string, updates: Partial<BulkUrlResult>): Promise<void> {
    const result = this.bulkUrlResults.get(id);
    if (result) {
      this.bulkUrlResults.set(id, { ...result, ...updates });
    }
  }
}

export const storage = new MemStorage();
