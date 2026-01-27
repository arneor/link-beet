import {
  type User,
  type InsertUser,
  type Business,
  type InsertBusiness,
  type UpdateBusinessRequest,
  type Campaign,
  type InsertCampaign,
  type DashboardStats,
} from "@shared/schema";

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
  getAllBusinesses(): Promise<
    Business[] & { connectionCount: number; emailCount: number }[]
  >;

  // Campaigns
  getCampaignsByBusiness(businessId: number): Promise<Campaign[]>;
  getAllCampaigns(): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(
    id: number,
    updates: Partial<InsertCampaign>,
  ): Promise<Campaign>;
  deleteCampaign(id: number): Promise<void>;

  // Analytics
  getDashboardStats(
    businessId: number,
  ): Promise<DashboardStats & { connectionsHistory: any[] }>;
  getAdminStats(): Promise<{
    totalBusinesses: number;
    totalConnections: number;
    totalActiveCampaigns: number;
    totalEmailsCollected: number;
  }>;
  logSession(
    businessId: number,
    deviceType?: string,
    email?: string,
  ): Promise<void>;
}

// In-memory storage with dummy data
export class MemoryStorage implements IStorage {
  private users: User[] = [];
  private businesses: Business[] = [];
  private campaigns: Campaign[] = [];
  private sessions: {
    id: number;
    businessId: number;
    userId?: number;
    email?: string;
    durationMinutes?: number;
    deviceType?: string;
    connectedAt: Date;
  }[] = [];

  private userIdCounter = 1;
  private businessIdCounter = 1;
  private campaignIdCounter = 1;
  private sessionIdCounter = 1;

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find((u) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find((u) => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.userIdCounter++,
      username: insertUser.username,
      password: insertUser.password,
      role: insertUser.role || "user",
      name: insertUser.name || null,
      email: insertUser.email || null,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  // Businesses
  async getBusiness(id: number): Promise<Business | undefined> {
    return this.businesses.find((b) => b.id === id);
  }

  async getBusinessByOwnerId(ownerId: number): Promise<Business | undefined> {
    return this.businesses.find((b) => b.ownerId === ownerId);
  }

  async createBusiness(business: InsertBusiness): Promise<Business> {
    const newBusiness: Business = {
      id: this.businessIdCounter++,
      ownerId: business.ownerId,
      name: business.name,
      category: (business as any).category ?? null,
      address: business.address || null,
      contactEmail: (business as any).contactEmail ?? null,
      contactPhone: (business as any).contactPhone ?? null,
      description: (business as any).description ?? null,
      operatingHours: (business as any).operatingHours ?? null,
      logoUrl: business.logoUrl || null,
      primaryColor: business.primaryColor || "#000000",
      wifiSsid: business.wifiSsid || null,
      wifiSessionDurationMinutes:
        (business as any).wifiSessionDurationMinutes ?? null,
      bandwidthKbps: (business as any).bandwidthKbps ?? null,
      maxConcurrentConnections:
        (business as any).maxConcurrentConnections ?? null,
      autoReconnect: (business as any).autoReconnect ?? true,
      profileType: business.profileType || "private",
      photos: (business as any).photos ?? null,
      banners: (business as any).banners ?? null,
      videoUrl: (business as any).videoUrl ?? null,
      onboardingCompleted: (business as any).onboardingCompleted ?? false,
      isActive: business.isActive ?? true,
      createdAt: new Date(),
    };
    this.businesses.push(newBusiness);
    return newBusiness;
  }

  async updateBusiness(
    id: number,
    updates: UpdateBusinessRequest,
  ): Promise<Business> {
    const index = this.businesses.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("Business not found");
    this.businesses[index] = { ...this.businesses[index], ...updates };
    return this.businesses[index];
  }

  async getAllBusinesses(): Promise<
    Business[] & { connectionCount: number; emailCount: number }[]
  > {
    return this.businesses.map((biz) => {
      const connectionCount = this.sessions.filter(
        (s) => s.businessId === biz.id,
      ).length;
      const emailCount = this.sessions.filter(
        (s) => s.businessId === biz.id && s.email,
      ).length;
      return { ...biz, connectionCount, emailCount };
    }) as any;
  }

  // Campaigns
  async getCampaignsByBusiness(businessId: number): Promise<Campaign[]> {
    return this.campaigns
      .filter((c) => c.businessId === businessId)
      .sort(
        (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
      );
  }

  async getAllCampaigns(): Promise<Campaign[]> {
    return [...this.campaigns].sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
    );
  }

  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const newCampaign: Campaign = {
      id: this.campaignIdCounter++,
      businessId: campaign.businessId ?? null,
      title: campaign.title,
      type: campaign.type,
      contentUrl: campaign.contentUrl,
      duration: campaign.duration ?? 5,
      isActive: campaign.isActive ?? true,
      startDate: campaign.startDate || null,
      endDate: campaign.endDate || null,
      targetBusinessIds: campaign.targetBusinessIds || null,
      views: 0,
      clicks: 0,
      createdAt: new Date(),
    };
    this.campaigns.push(newCampaign);
    return newCampaign;
  }

  async updateCampaign(
    id: number,
    updates: Partial<InsertCampaign>,
  ): Promise<Campaign> {
    const index = this.campaigns.findIndex((c) => c.id === id);
    if (index === -1) throw new Error("Campaign not found");
    this.campaigns[index] = { ...this.campaigns[index], ...updates };
    return this.campaigns[index];
  }

  async deleteCampaign(id: number): Promise<void> {
    const index = this.campaigns.findIndex((c) => c.id === id);
    if (index !== -1) {
      this.campaigns.splice(index, 1);
    }
  }

  // Analytics
  async getDashboardStats(
    businessId: number,
  ): Promise<DashboardStats & { connectionsHistory: any[] }> {
    const businessSessions = this.sessions.filter(
      (s) => s.businessId === businessId,
    );
    const totalConnections = businessSessions.length;

    // Mock history data for charts
    const history = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      history.push({
        date: d.toISOString(),
        count: Math.floor(Math.random() * 100) + 20,
      });
    }

    return {
      totalConnections,
      activeUsers: Math.floor(Math.random() * 20) + 5,
      totalAdsServed: totalConnections * 3,
      revenue: totalConnections * 0.15,
      connectionsHistory: history,
    };
  }

  async getAdminStats(): Promise<{
    totalBusinesses: number;
    totalConnections: number;
    totalActiveCampaigns: number;
    totalEmailsCollected: number;
  }> {
    return {
      totalBusinesses: this.businesses.length,
      totalConnections: this.sessions.length,
      totalActiveCampaigns: this.campaigns.filter((c) => c.isActive).length,
      totalEmailsCollected: this.sessions.filter((s) => s.email).length,
    };
  }

  async logSession(
    businessId: number,
    deviceType: string = "mobile",
    email?: string,
  ): Promise<void> {
    this.sessions.push({
      id: this.sessionIdCounter++,
      businessId,
      deviceType,
      email,
      durationMinutes: 30,
      connectedAt: new Date(),
    });
  }
}

export const storage = new MemoryStorage();
