# AG Sindh Backend - Vercel Deployment Guide

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **PostgreSQL Database**: You'll need a PostgreSQL database (recommended: Supabase, Neon, or Railway)
3. **Vercel CLI** (optional): `npm i -g vercel`

## Deployment Steps

### 1. Database Setup

First, set up a PostgreSQL database:

**Option A: Supabase (Recommended)**
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get your database connection string from Settings > Database

**Option B: Neon**
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Get your database connection string

### 2. Environment Variables

Set up these environment variables in Vercel:

```bash
DATABASE_URL="postgresql://username:password@host:port/database"
JWT_SECRET="your-super-secret-jwt-key"
FRONTEND_URL="https://your-frontend-domain.vercel.app"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

### 3. Deploy to Vercel

**Option A: Using Vercel Dashboard**
1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Set the root directory to `Backend`
5. Add environment variables
6. Deploy

**Option B: Using Vercel CLI**
```bash
cd Backend
vercel
```

### 4. Database Migration

After deployment, run database migrations:

```bash
# Using Vercel CLI
vercel env pull .env.local
npx prisma db push --schema=./prisma/schema.prisma

# Or using Vercel dashboard
# Go to your project > Functions > api > View Function Logs
# Add a temporary endpoint to run migrations
```

### 5. Update Frontend Configuration

Update your frontend's API base URL to point to your Vercel deployment:

```typescript
// In your frontend config
const API_BASE_URL = "https://your-backend-domain.vercel.app/api/v1";
```

## Important Notes

1. **File Uploads**: Vercel has limitations for file uploads. Consider using Cloudinary or similar services for file storage.

2. **Database Connections**: Use connection pooling for production databases.

3. **CORS**: Update the `FRONTEND_URL` environment variable to match your frontend domain.

4. **Cold Starts**: Vercel functions have cold starts. Consider using Vercel Pro for better performance.

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure your database allows external connections
2. **Environment Variables**: Double-check all environment variables are set correctly
3. **CORS Errors**: Verify the `FRONTEND_URL` is correct
4. **Build Errors**: Check the build logs in Vercel dashboard

### Useful Commands

```bash
# Check deployment status
vercel ls

# View function logs
vercel logs

# Redeploy
vercel --prod
```

## API Endpoints

Your API will be available at:
- Health: `https://your-domain.vercel.app/api/v1/health`
- Auth: `https://your-domain.vercel.app/api/v1/auth`
- Departments: `https://your-domain.vercel.app/api/v1/departments`
- And more... 