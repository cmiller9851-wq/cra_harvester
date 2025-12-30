# CRA Harvester

## Overview

CRA Harvester is a full-stack web application for tracking and managing harvested items with yield reporting capabilities. The system features a React frontend dashboard with data visualization, an Express backend API, and PostgreSQL database storage. It includes integration with Telegram for notifications and Arweave for blockchain verification of transaction records.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state management and caching
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style variant)
- **Charts**: Recharts for dashboard analytics and data visualization
- **Animations**: Framer Motion for page transitions and list animations
- **Build Tool**: Vite with React plugin

The frontend follows a pages-based architecture with reusable components in `client/src/components/`. UI components from shadcn/ui are stored in `client/src/components/ui/`. Custom hooks manage data fetching and toast notifications.

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Server**: Node.js with HTTP server
- **API Design**: RESTful endpoints defined in `shared/routes.ts` using Zod schemas for type-safe validation
- **Development**: Vite middleware integration for HMR during development
- **Production**: Static file serving from built assets

The backend uses a storage abstraction layer (`server/storage.ts`) implementing the repository pattern for database operations.

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - shared between frontend and backend
- **Migrations**: Drizzle Kit for schema management (`drizzle.config.ts`)
- **Connection**: pg Pool with connection string from `DATABASE_URL` environment variable

Database tables:
- `harvested_items`: Stores harvested content with title, source URL, content, and status
- `yield_reports`: Stores financial yield calculations with penalties, tributes, and totals

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database schema definitions and Zod validation schemas
- `routes.ts`: API route definitions with input/output types

### External Service Integrations
- **Telegram Bot**: Notifications via `node-telegram-bot-api` (requires `BOT_TOKEN` and `CHAT_ID` env vars)
- **Arweave**: Transaction verification for blockchain proof-of-existence checks
- **Axios**: HTTP client for external API calls

## External Dependencies

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string (required)
- `BOT_TOKEN`: Telegram bot token (optional, for notifications)
- `CHAT_ID`: Telegram chat ID for notifications (optional)

### Third-Party Services
- **PostgreSQL**: Primary data storage
- **Arweave Network**: Blockchain verification (read-only, verifies transaction status)
- **Telegram API**: Bot notifications for harvest cycle events

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Client-side data fetching
- `zod` / `drizzle-zod`: Schema validation
- `node-telegram-bot-api`: Telegram integration
- `recharts`: Data visualization
- `framer-motion`: Animations
- `date-fns`: Date formatting
- shadcn/ui ecosystem (Radix UI primitives)

### Build Configuration
- Development: `npm run dev` - runs tsx with Vite HMR
- Production: `npm run build` - bundles with esbuild and Vite
- Database: `npm run db:push` - pushes schema changes to database