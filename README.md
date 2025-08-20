# Job Tracker Pro

A comprehensive job application tracking platform built with Next.js 15, featuring job search integration, application management, and progress tracking.

Live demo: [Job Tracker Pro](https://jobtracker-pro-git-main-joannas-projects-4e82169f.vercel.app/)

<img src="public/jobTracker.png" alt="Job Tracker Pro Screenshot" width="600">

## 🚀 Features

### Job Search & Discovery
- **External Job API Integration**: Search jobs from external APIs (Adzuna)
- **Advanced Filtering**: Filter by location, salary, job type, and keywords
- **Pagination**: Browse through paginated job results
- **Job Details**: View comprehensive job information with external links

### Application Management
- **One-Click Apply Tracking**: Mark jobs as applied with a single click
- **Status Management**: Track application progress (Applied, Reviewing, Interview, Accepted, Rejected)
- **Dashboard View**: Centralized view of all job applications
- **Smart Sorting**: Applications sorted by priority (Interview > Reviewing > Applied > Accepted > Rejected)
- **Timeline Tracking**: See when applications were submitted with relative timestamps

### User Authentication
- **NextAuth.js Integration**: Secure authentication system
- **Multiple Providers**: Support for various OAuth providers
- **Session Management**: Persistent user sessions across the platform

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** for component architecture
- **TypeScript** for type safety
- **Tailwind CSS 4** for styling
- **Client-side State Management** with React hooks

### Backend & Database
- **Next.js API Routes** for serverless backend
- **Prisma ORM** for database operations
- **PostgreSQL** (via Neon) for data persistence
- **NextAuth.js** with Prisma adapter for authentication

### External Integrations
- **Adzuna API** for job search functionality
- **Date-fns** for date formatting and manipulation

## 📁 Project Structure

```
jobtracker-pro/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── applications/         # Application CRUD endpoints
│   │   └── auth/                 # Authentication endpoints
│   ├── auth/signin/              # Authentication pages
│   ├── dashboard/                # Application dashboard
│   ├── jobs/                     # Job search interface
│   └── layout.tsx                # Root layout
├── components/                   # Reusable components
│   ├── JobCard.tsx              # Individual job display
│   ├── JobList.tsx              # Job listings container
│   ├── JobSearchForm.tsx        # Search form component
│   ├── ApplyButton.tsx          # Application tracking button
│   ├── StatusSelector.tsx       # Application status management
│   ├── SmartNavbar.tsx          # Navigation component
│   └── DashboardClient.tsx      # Client-side dashboard logic
├── lib/                         # Utility libraries
│   ├── adzuna.ts               # Job API integration
│   ├── prisma.ts               # Database connection
│   ├── auth.ts                 # Authentication config
│   ├── jobService.ts           # Job-related business logic
│   └── types.ts                # TypeScript type definitions
├── hooks/                      # Custom React hooks
│   └── useSearchState.ts       # Search state management
├── prisma/                     # Database schema & migrations
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
└── public/                     # Static assets
```

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- PostgreSQL database (recommend [Neon](https://neon.tech) for serverless)

### Environment Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd jobtracker-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@host:port/database"
   
   # NextAuth
   NEXTAUTH_SECRET="your-secret-key"
   NEXTAUTH_URL="http://localhost:3000"
   
   # Job API (Adzuna)
   ADZUNA_APP_ID="your-adzuna-app-id"
   ADZUNA_API_KEY="your-adzuna-api-key"
   ```

4. **Database setup**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate deploy
   
   # (Optional) Seed database
   npx prisma db seed
   ```

5. **Development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 🔧 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint for code quality
- `npm run postinstall` - Generate Prisma client (auto-runs after install)

## 📊 Database Schema

### User Model
- Authentication via NextAuth
- Linked to job applications

### Application Model
- Job application tracking
- Status management
- External job reference
- Timestamps for application tracking

### Key Relationships
- `User` → `Applications` (One-to-Many)
- Applications linked to external job sources

## 🔌 API Endpoints

### Applications API
- `GET /api/applications` - Fetch user applications
- `POST /api/applications` - Create new application
- `PUT /api/applications/[id]` - Update application status
- `DELETE /api/applications/[id]` - Remove application

### Authentication
- `POST /api/auth/[...nextauth]` - NextAuth.js endpoints

## 🌐 Deployment

### Vercel Deployment
The application is optimized for Vercel deployment:

1. **Push to GitHub**
2. **Connect to Vercel**
3. **Configure environment variables**
4. **Deploy automatically**

### Key Configuration
- `postinstall` script ensures Prisma client generation
- Build script includes `prisma generate`
- Optimized for serverless functions

## 📚 Documentation Links

- **Next.js**: [https://nextjs.org/docs](https://nextjs.org/docs)
- **Prisma**: [https://www.prisma.io/docs](https://www.prisma.io/docs)
- **NextAuth.js**: [https://authjs.dev](https://authjs.dev)
- **Tailwind CSS**: [https://tailwindcss.com/docs](https://tailwindcss.com/docs)
- **Vercel Deployment**: [https://vercel.com/docs](https://vercel.com/docs)
- **Adzuna API**: [https://developer.adzuna.com](https://developer.adzuna.com)

## 🔍 Application Flow

1. **Job Search**: Users search for jobs using the integrated job API
2. **Browse Results**: Paginated job listings with detailed information
3. **Apply Tracking**: One-click application tracking with status management
4. **Dashboard Management**: Centralized view of all applications with status updates
5. **Progress Tracking**: Monitor application progress through various stages

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.
