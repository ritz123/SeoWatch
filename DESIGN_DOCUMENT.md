# SEO Watch - Design Document

## Project Overview

SEO Watch is a full-stack web application that analyzes websites for SEO optimization. Users can enter any website URL and receive comprehensive SEO analysis including tag validation, scoring, and social media preview generation.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling and development server
- **TailwindCSS** for styling with custom UI components
- **Radix UI** for accessible component primitives
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **Zod** for schema validation

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **Cheerio** for HTML parsing and DOM manipulation
- **Axios** for HTTP requests to target websites
- **Zod** for request/response validation

### Development Tools
- **TSX** for TypeScript execution in development
- **ESBuild** for production builds
- **Drizzle** for database operations (configured but not actively used in current implementation)

## Project Structure

```
SeoWatch/
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── ui/         # Reusable UI components (buttons, cards, etc.)
│   │   │   ├── preview-cards.tsx      # Social media preview components
│   │   │   ├── seo-analyzer.tsx       # Main analysis interface
│   │   │   ├── seo-score-card.tsx     # Score display component
│   │   │   └── seo-tags-table.tsx     # SEO tags results table
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and configurations
│   │   └── pages/          # Page components
│   └── index.html          # HTML entry point
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point and middleware setup
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Database configuration
│   └── vite.ts            # Vite development integration
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Zod schemas for API validation
└── package.json           # Dependencies and scripts
```

## Backend API Documentation

### Base URL
- Development: `http://localhost:5000`
- Production: Configurable via `PORT` environment variable

### Endpoints

#### POST /api/analyze
Analyzes a website URL for SEO optimization.

**Request Body:**
```json
{
  "url": "string" // Website URL to analyze (protocol optional)
}
```

**Response:**
```json
{
  "url": "string",           // Analyzed URL with protocol
  "score": "number",         // SEO score (0-100)
  "tags": [                  // Array of SEO tag analysis
    {
      "tag": "string",       // Tag name (e.g., "Title", "Meta Description")
      "content": "string",   // Tag content or "-" if missing
      "status": "good|warning|missing|error",
      "feedback": "string",  // Human-readable feedback
      "deduction": "number"  // Points deducted from score
    }
  ],
  "breakdown": [             // Score breakdown details
    {
      "tag": "string",       // Tag category
      "issue": "string",     // Specific issue found
      "deduction": "number"  // Points deducted
    }
  ],
  "previews": {              // Social media preview data
    "google": {
      "title": "string",
      "description": "string",
      "url": "string"
    },
    "facebook": {
      "title": "string",
      "description": "string",
      "image": "string?",
      "domain": "string"
    },
    "twitter": {
      "title": "string",
      "description": "string", 
      "image": "string?",
      "card": "string",
      "domain": "string"
    },
    "linkedin": {
      "title": "string",
      "description": "string",
      "image": "string?", 
      "domain": "string"
    }
  }
}
```

**Error Responses:**
- `400`: Invalid URL or website unreachable
- `500`: Internal server error

### SEO Analysis Features

The backend performs comprehensive SEO analysis including:

1. **Title Tag Analysis**
   - Checks for presence
   - Validates length (optimal: 50-60 characters)
   - Deducts points for missing (-25) or suboptimal length (-10)

2. **Meta Description Analysis**
   - Checks for presence
   - Validates length (optimal: 150-160 characters)
   - Deducts points for missing (-20) or suboptimal length (-10)

3. **Meta Robots Analysis**
   - Checks for presence
   - Deducts points if missing (-5)

4. **Open Graph Tags**
   - Validates og:title, og:description, og:image
   - Deducts points for missing tags (-5 each)

5. **Twitter Card Tags**
   - Validates twitter:card, twitter:title, twitter:description, twitter:image
   - Deducts points for missing tags (-5 each)

## Frontend Architecture

### Component Structure

#### Main Components

1. **SeoAnalyzer** (`seo-analyzer.tsx`)
   - Main interface component
   - Handles URL input and form submission
   - Manages analysis state and error handling

2. **SeoScoreCard** (`seo-score-card.tsx`)
   - Displays overall SEO score
   - Shows visual score representation
   - Renders score breakdown details

3. **SeoTagsTable** (`seo-tags-table.tsx`)
   - Tabular display of SEO tag analysis
   - Color-coded status indicators
   - Detailed feedback for each tag

4. **PreviewCards** (`preview-cards.tsx`)
   - Social media preview generation
   - Shows how content appears on Google, Facebook, Twitter, LinkedIn
   - Visual representation of meta tag usage

#### UI Components

The project uses a comprehensive design system built on Radix UI primitives:
- Buttons, Cards, Tables, Badges
- Form controls (Input, Select, Checkbox)
- Layout components (Accordion, Tabs, Separator)
- Feedback components (Alert, Toast, Progress)
- Navigation components (Breadcrumb, Menu)

### State Management

- **TanStack Query** for server state management
- **React Hook Form** for form state and validation
- Local component state for UI interactions

### Routing

Uses **Wouter** for lightweight client-side routing:
- `/` - Home page with SEO analyzer
- `/*` - 404 Not Found page

## Data Flow

1. **User Input**: User enters URL in the analyzer form
2. **Validation**: Client-side validation using Zod schemas
3. **API Request**: POST request to `/api/analyze` endpoint
4. **Server Processing**: 
   - URL normalization (adds https:// if missing)
   - HTTP request to target website
   - HTML parsing with Cheerio
   - SEO tag extraction and analysis
   - Score calculation
   - Preview data generation
5. **Response**: Structured analysis data returned to client
6. **UI Update**: Results displayed in score card, tags table, and preview cards

## Security Considerations

- **Input Sanitization**: All extracted content is sanitized to prevent XSS
- **Request Timeout**: 10-second timeout for external website requests
- **User Agent**: Uses standard browser user agent for website requests
- **Error Handling**: Graceful handling of network errors and invalid URLs

## Performance Features

- **Request Logging**: Comprehensive API request logging with timing
- **Error Boundaries**: Graceful error handling throughout the application
- **Responsive Design**: Mobile-first responsive layout
- **Loading States**: User feedback during analysis processing

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation & Running
```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

### Available Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build client and server for production
- `npm start` - Start production server
- `npm run check` - TypeScript type checking
- `npm run db:push` - Push database schema changes

## Environment Configuration

- **NODE_ENV**: Set to 'development' or 'production'
- **PORT**: Server port (default: 5000)
- Database configuration available via Drizzle but not actively used

## Future Enhancements

1. **Database Integration**: Store analysis history and user accounts
2. **Batch Analysis**: Analyze multiple URLs simultaneously
3. **Scheduled Monitoring**: Periodic SEO monitoring for registered websites
4. **Advanced SEO Checks**: Image alt tags, heading structure, internal linking
5. **Performance Metrics**: Core Web Vitals integration
6. **Export Features**: PDF reports and CSV exports
7. **API Rate Limiting**: Implement rate limiting for production use

## Browser Support

- Modern browsers supporting ES2020+
- Mobile responsive design
- Progressive enhancement for accessibility
