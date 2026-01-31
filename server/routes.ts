import type { Express } from "express";
import type { Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Routes have been migrated to the NestJS backend.
  // This server now primarily serves the frontend via Vite in development.

  return httpServer;
}
