# 🚀 Study Planner Deployment Guide

## 📋 Prerequisites
- [Supabase Account](https://supabase.com) (free)
- [Vercel Account](https://vercel.com) (free)
- GitHub repository

## 🗄️ Step 1: Set up Supabase Database

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up with GitHub
3. Create new organization: "Study Planner"
4. Create new project: "study-planner-prod"

### 1.2 Get Database Connection
1. In Supabase dashboard → **Settings** → **Database**
2. Copy the **Connection string** (URI format)
3. It looks like: `postgresql://postgres:[password]@[host]:5432/postgres`

### 1.3 Set up Database Schema
```bash
# Update your .env file with Supabase URL
DATABASE_URL="postgresql://postgres:[your-password]@[your-host]:5432/postgres"

# Generate Prisma client for PostgreSQL
npx prisma generate

# Push schema to Supabase
npx prisma db push

# Seed the database
npm run db:seed
```

## 🌐 Step 2: Deploy to Vercel

### 2.1 Connect GitHub to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Import your repository: "StudyPlanner"

### 2.2 Configure Environment Variables
In Vercel dashboard → **Settings** → **Environment Variables**:
```
DATABASE_URL = postgresql://postgres:[password]@[host]:5432/postgres
```

### 2.3 Deploy
1. Vercel will automatically detect Next.js
2. Build command: `npm run build`
3. Output directory: `.next`
4. Install command: `npm install`

## 🔧 Step 3: Database Migration

### 3.1 Development (SQLite)
```bash
# Use SQLite for local development
DATABASE_URL="file:./dev.db"
npx prisma db push
```

### 3.2 Production (PostgreSQL)
```bash
# Use PostgreSQL for production
DATABASE_URL="postgresql://..."
npx prisma db push
```

## 📊 Step 4: Verify Deployment

### 4.1 Check Database Connection
- Visit your Vercel URL
- Add a course to test database connection
- Check Supabase dashboard for data

### 4.2 Monitor Performance
- Vercel Analytics (free)
- Supabase Dashboard → **Logs**

## 🔄 Step 5: Continuous Deployment

### 5.1 Automatic Deployments
- Push to `main` branch → auto-deploy
- Preview deployments for PRs

### 5.2 Database Migrations
```bash
# After schema changes
npx prisma db push
git add .
git commit -m "Update database schema"
git push
```

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Check connection
npx prisma db pull

# Reset database
npx prisma db push --force-reset
```

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

### Environment Variables
- Ensure `DATABASE_URL` is set in Vercel
- Check for typos in connection string
- Verify Supabase project is active

## 📈 Performance Tips

### Database Optimization
- Use Supabase connection pooling
- Implement caching for frequently accessed data
- Monitor query performance in Supabase dashboard

### Vercel Optimization
- Enable Edge Functions for API routes
- Use Image Optimization for any images
- Implement proper caching headers

## 🔐 Security Notes

### Environment Variables
- Never commit `.env` files
- Use Vercel's environment variable system
- Rotate database passwords regularly

### Database Security
- Supabase handles most security automatically
- Enable Row Level Security (RLS) if needed
- Monitor access logs in Supabase dashboard

## 🎯 Next Steps

1. **Custom Domain**: Add your domain in Vercel
2. **Analytics**: Set up Vercel Analytics
3. **Monitoring**: Configure error tracking
4. **Backup**: Set up automated database backups in Supabase

## 📞 Support

- **Vercel Issues**: [Vercel Support](https://vercel.com/support)
- **Supabase Issues**: [Supabase Discord](https://discord.supabase.com)
- **Prisma Issues**: [Prisma Docs](https://pris.ly/d/getting-started)

---

**Your Study Planner will be live at**: `https://your-project.vercel.app` 🎉 