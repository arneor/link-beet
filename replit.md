# MARK MORPH - WiFi Advertising Platform

## Overview

MARK MORPH is a captive portal WiFi advertising platform that monetizes free WiFi access by displaying targeted advertisements to users. The platform serves three stakeholder types: end users (WiFi seekers), business owners (venue operators), and platform administrators. End users connect to free WiFi through a branded splash page with ads, businesses manage their profiles and campaigns through a dashboard, and admins oversee the entire platform.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Animations**: Framer Motion for smooth transitions
- **Charts**: Recharts for analytics visualizations
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript with ESM modules
- **Build Tool**: esbuild for server bundling, Vite for client
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas for type-safe contracts

### Data Storage
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM with drizzle-zod for schema validation
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Tables**: users, businesses, campaigns, sessions (for WiFi analytics)

### Authentication
- Mock authentication system for development
- Session-based auth with connect-pg-simple for PostgreSQL session storage
- Three user roles: admin, business, user

### Key Design Patterns
- **Shared Types**: The `shared/` directory contains schemas and route definitions used by both client and server
- **Path Aliases**: `@/` maps to client/src, `@shared/` maps to shared/
- **API Contract**: Routes are defined declaratively with input/output Zod schemas in `shared/routes.ts`
- **Storage Abstraction**: `server/storage.ts` provides a clean interface over database operations

### Route Structure
- `/` - Landing page with login
- `/business/:id` - Business dashboard overview
- `/business/:id/profile` - Business profile settings
- `/business/:id/campaigns` - Ad campaign management
- `/splash/:businessId` - End user captive portal page
- `/admin` - Platform administration

## External Dependencies

### Database
- PostgreSQL (required, connection via DATABASE_URL environment variable)
- Drizzle Kit for migrations (`npm run db:push`)

### UI Components
- Radix UI primitives (dialog, dropdown, tabs, etc.)
- shadcn/ui component library configured in `components.json`

### Development Tools
- Replit-specific Vite plugins for development (cartographer, dev-banner, runtime-error-modal)

### Fonts
- Outfit (display font)
- Inter (body font)
- Loaded via Google Fonts