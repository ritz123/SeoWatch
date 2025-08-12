# SeoWatch - SEO Tag Visual Manager

A full-stack web application that analyzes website SEO performance by extracting and validating meta tags. Enter any website URL to get an SEO score, detailed tag analysis, and interactive social media previews.

## Features

- **URL Analysis**: Enter any website URL for comprehensive SEO analysis
- **SEO Scoring**: Get a score out of 100 with detailed breakdown of issues
- **Tag Validation**: Analyzes title, meta description, robots, Open Graph, and Twitter Card tags
- **Social Previews**: See how your site appears on Google SERP, Facebook, Twitter, and LinkedIn
- **Real-time Analysis**: Server-side HTML fetching avoids CORS issues
- **Mobile-friendly**: Responsive design works on all devices

## Technology Stack

### Frontend
- **React** with TypeScript
- **Vite** for build tooling and development
- **TailwindCSS** for styling
- **Shadcn/ui** components for UI elements
- **TanStack Query** for API state management
- **Wouter** for client-side routing

### Backend
- **Node.js** with Express
- **TypeScript** with ES modules
- **Cheerio** for HTML parsing
- **Axios** for HTTP requests
- **Zod** for validation

### Database (Optional)
- **PostgreSQL** with Neon serverless
- **Drizzle ORM** for database operations
- In-memory storage fallback for development

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd seowatch
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup** (Optional)
   Create a `.env` file in the root directory:
   ```env
   # Optional: Database configuration
   DATABASE_URL=your_postgresql_connection_string
   
   # Development settings
   NODE_ENV=development
   PORT=5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open your browser and navigate to `http://localhost:5000`

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utility libraries
│   │   ├── pages/         # Page components
│   │   └── App.tsx        # Main app component
│   └── index.html         # HTML entry point
├── server/                # Backend Express application
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API route definitions
│   ├── storage.ts        # Data storage interface
│   └── vite.ts           # Vite integration
├── shared/               # Shared TypeScript schemas
│   └── schema.ts         # Zod validation schemas
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## API Endpoints

### POST `/api/analyze`
Analyzes a website's SEO tags and returns comprehensive results.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "url": "https://example.com",
  "score": 85,
  "tags": [...],
  "breakdown": [...],
  "previews": {
    "google": {...},
    "facebook": {...},
    "twitter": {...},
    "linkedin": {...}
  }
}
```

## Deployment Options

### Option 1: Replit Deployment (Recommended)
1. Fork this Replit project
2. Click "Deploy" in the Replit interface
3. Configure custom domain if needed

### Option 2: Vercel Deployment
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Follow the deployment prompts

### Option 3: Railway Deployment
1. Connect your GitHub repository to Railway
2. Railway will auto-detect the Node.js setup
3. Set environment variables in Railway dashboard

### Option 4: Traditional VPS/Cloud Server
1. Install Node.js 18+ on your server
2. Clone the repository
3. Install dependencies: `npm install`
4. Build the application: `npm run build`
5. Start with process manager: `pm2 start server/index.ts`
6. Configure reverse proxy (nginx/Apache) if needed

## Configuration

### Environment Variables
- `NODE_ENV`: Set to 'production' for production builds
- `PORT`: Server port (default: 5000)
- `DATABASE_URL`: PostgreSQL connection string (optional)

### SEO Analysis Rules
- **Title**: Optimal length 50-60 characters
- **Meta Description**: Optimal length 150-160 characters
- **Required Tags**: robots, og:title, og:description, og:image
- **Twitter Cards**: Requires twitter:card, twitter:title, twitter:description

### Scoring System
- Starts at 100 points
- Deductions:
  - Missing title: -25 points
  - Missing meta description: -20 points
  - Suboptimal length: -10 points
  - Missing robots: -5 points
  - Missing Open Graph/Twitter tags: -5 points each

## Development

### Available Scripts
- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
- `npm run lint`: Run ESLint code analysis

### Adding New Features
1. Define data schemas in `shared/schema.ts`
2. Implement API routes in `server/routes.ts`
3. Create frontend components in `client/src/components/`
4. Update types and validation as needed

## Troubleshooting

### Common Issues

**CORS Errors**: The app fetches websites server-side to avoid CORS issues. If you encounter CORS problems, ensure you're using the API endpoint.

**Timeout Errors**: Some websites may take longer to respond. The default timeout is 10 seconds. Increase in `server/routes.ts` if needed.

**Missing Dependencies**: Run `npm install` to ensure all packages are installed.

**Port Conflicts**: Change the PORT environment variable if 5000 is already in use.

### Performance Optimization
- Analysis typically completes in under 3 seconds
- Large websites may take longer due to HTML size
- Consider implementing caching for repeated analyses

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and test thoroughly
4. Commit with clear messages: `git commit -m "Add feature description"`
5. Push and create a pull request

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the code documentation
- Create an issue in the repository

---

Built with ❤️ using modern web technologies for SEO professionals and developers.