# SeoWatch - SEO Tag Visual Manager

## Overview

SeoWatch is a full-stack web application that analyzes website SEO performance by extracting and validating meta tags. Users can input any website URL, and the app fetches the HTML server-side, extracts SEO-related meta tags, validates them against best practices, calculates an SEO score out of 100, and displays interactive previews showing how the page would appear on different social platforms (Google SERP, Facebook, Twitter, LinkedIn).

## Recent Changes

### August 12, 2025
- **Project Completion**: Built complete SEO analysis tool with all requested features
- **Documentation Added**: Created comprehensive README.md with installation and deployment instructions
- **Features Implemented**: URL analysis, SEO scoring, tag validation, social media previews
- **UI Complete**: Professional interface with color-coded scoring and responsive design
- **Deployment Ready**: Multiple deployment options documented (Replit, Vercel, Railway, VPS)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives for accessibility
- **Styling**: TailwindCSS with custom CSS variables for theming
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with a single `/api/analyze` endpoint
- **HTML Parsing**: Cheerio for server-side DOM manipulation and tag extraction
- **HTTP Client**: Axios for fetching external website content
- **CORS Handling**: Server-side fetching eliminates client-side CORS issues

### Data Storage Solutions
- **Primary Storage**: PostgreSQL database using Neon serverless
- **ORM**: Drizzle ORM for type-safe database operations
- **Session Storage**: PostgreSQL-backed sessions using connect-pg-simple
- **In-Memory Fallback**: MemStorage class for development/testing without database

### SEO Analysis Engine
- **Tag Extraction**: Extracts title, meta description, robots, Open Graph, and Twitter Card tags
- **Validation Rules**: 
  - Title: 50-60 characters optimal
  - Description: 150-160 characters optimal
  - Required tags: robots, og:title, og:description, og:image, twitter:card
- **Scoring System**: Starts at 100 points with deductions for missing or suboptimal tags
- **Preview Generation**: Creates platform-specific previews for Google, Facebook, Twitter, and LinkedIn

### Authentication and Authorization
- Currently uses a basic user storage interface with in-memory implementation
- Designed to be extensible for future authentication implementations
- Session-based approach with PostgreSQL session store

## External Dependencies

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting
- **Connection**: Uses `@neondatabase/serverless` for database connectivity

### UI Component Libraries
- **Radix UI**: Complete set of accessible component primitives
- **Lucide React**: Icon library for consistent iconography
- **TailwindCSS**: Utility-first CSS framework for rapid styling

### Development Tools
- **Vite**: Fast build tool with HMR support
- **TypeScript**: Type safety across the entire stack
- **Drizzle Kit**: Database schema management and migrations
- **ESBuild**: Fast JavaScript bundler for production builds

### Runtime Libraries
- **Cheerio**: Server-side HTML parsing and manipulation
- **Axios**: HTTP client for external website fetching
- **Zod**: Runtime type validation and schema definition
- **Date-fns**: Date manipulation utilities

### Replit Integration
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling integration