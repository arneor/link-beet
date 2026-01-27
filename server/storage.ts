import { db } from "./db";
import {
  users, businesses, campaigns, sessions,
  type User, type InsertUser,
  type Business, type InsertBusiness, type UpdateBusinessRequest,
  type Campaign, type InsertCampaign,
  type DashboardStats
} from "@shared/schema";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Businesses
  getBusiness(id: number): Promise<Business | undefined>;
  getBusinessByOwnerId(ownerId: number): Promise<Business | undefined>;
  createBusiness(business: InsertBusiness): Promise<Business>;
  updateBusiness(id: number, updates: UpdateBusinessRequest): Promise<Business>;
  getAllBusinesses(): Promise<Business[]>;

  // Campaigns
  getCampaignsByBusiness(businessId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;

  // Analytics
  getDashboardStats(businessId: number): Promise<DashboardStats & { connectionsHistory: any[] }>;
  logSession(businessId: number, deviceType?: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Businesses
  async getBusiness(id: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business;
  }

  async getBusinessByOwnerId(ownerId: number): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.ownerId, ownerId));
    return business;
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const [newBusiness] = await db.insert(businesses).values(business).returning();
    return newBusiness;
  }

  async updateBusiness(id: number, updates: UpdateBusinessRequest): Promise<Business> {
    const [updated] = await db.update(businesses)
      .set(updates)
      .where(eq(businesses.id, id))
      .returning();
    return updated;
  }

  async getAllBusinesses(): Promise<Business[]> {
    return await db.select().from(businesses);
  }

  // Campaigns
  async getCampaignsByBusiness(businessId: number): Promise<Campaign[]> {
    return await db.select().from(campaigns)
      .where(eq(campaigns.businessId, businessId))
      .orderBy(desc(campaigns.createdAt));
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async deleteCampaign(id: number): Promise<void> {
    await db.delete(campaigns).where(eq(campaigns.id, id));
  }

  // Analytics (Mocked/Simple implementation)
  async getDashboardStats(businessId: number): Promise<DashboardStats & { connectionsHistory: any[] }> {
    // In a real app, these would be complex aggregation queries
    const connections = await db.select({ count: sql<number>`count(*)` }).from(sessions).where(eq(sessions.businessId, businessId));
    
    // Mock history data for charts
    const history = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      history.push({
        date: d.toISOString(),
        count: Math.floor(Math.random() * 100) + 20
      });
    }

    return {
      totalConnections: Number(connections[0]?.count || 0),
      activeUsers: Math.floor(Math.random() * 20) + 5, // Mock
      totalAdsServed: Number(connections[0]?.count || 0) * 3, // Approx 3 ads per session
      revenue: Number(connections[0]?.count || 0) * 0.15, // $0.15 per session
      connectionsHistory: history
    };
  }

  async logSession(businessId: number, deviceType: string = 'mobile'): Promise<void> {
    await db.insert(sessions).values({
      businessId,
      deviceType,
      durationMinutes: 30
    });
  }
}

export const storage = new DatabaseStorage();
