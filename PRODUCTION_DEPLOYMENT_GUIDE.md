# Cedokamall - Production Deployment Guide

## 📋 Pre-Deployment Checklist

### Code Quality

- [x] Build completes without errors
- [x] Linting passes (0 errors, 8 warnings only)
- [x] Tests pass (vitest configured)
- [x] No console errors in production
- [x] TypeScript strict mode enabled

### Security

- [ ] Replace mock authentication with real backend
- [ ] Implement JWT tokens
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Set secure environment variables
- [ ] Enable rate limiting
- [ ] Implement input validation on backend
- [ ] Set up SSL certificate

### Performance

- [x] Build bundle size optimized (357 KB main, 161 KB vendor)
- [x] Image optimization implemented
- [x] Code splitting configured
- [x] Lazy loading framework ready
- [ ] Monitor Core Web Vitals
- [ ] Set up CDN
- [ ] Enable gzip compression

### SEO

- [x] Meta tags configured
- [ ] Submit sitemap to Google Search Console
- [ ] Verify in Google Search Console
- [ ] Set up Google Analytics
- [ ] Configure robots.txt properly
- [ ] Ensure canonical URLs

### Scalability

- [ ] Database configured for scale
- [ ] Caching strategy in place
- [ ] API rate limiting configured
- [ ] Load balancing set up
- [ ] Monitoring and alerts active

---

## 🚀 Deployment Steps

### Step 1: Build for Production

```bash
# Clean previous build
rm -rf dist

# Create production build
npm run build

# Output folder: dist/
# Contains:
# ├── index.html
# ├── assets/
# │   ├── index-*.js (main bundle)
# │   ├── vendor-*.js (React, dependencies)
# │   ├── ui-*.js (UI components)
# │   ├── utils-*.js (utilities)
# │   └── index-*.css (styles)
# └── robots.txt (search engine directives)
```

### Step 2: Choose Hosting Platform

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Environment variables set in Vercel dashboard
```

**Vercel Config:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "env": {
    "VITE_API_URL": "https://api.cedokamall.com"
  }
}
```

#### Option B: Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist

# Or connect GitHub for auto-deploy
```

**Netlify Config (netlify.toml):**

```toml
[build]
  command = "npm run build"
  publish = "dist"

[dev]
  command = "npm run dev"
  port = 8080

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

#### Option C: AWS S3 + CloudFront

```bash
# Build
npm run build

# Upload to S3
aws s3 sync dist/ s3://cedokamall/

# Invalidate CloudFront
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

#### Option D: Docker + Any Server

```dockerfile
# Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
```

```bash
docker build -t cedokamall:latest .
docker run -p 80:80 cedokamall:latest
```

### Step 3: Domain Setup

1. **Point Domain to Hosting**

   ```
   DNS A Record:
   cedokamall.com → Your Hosting IP
   ```

2. **CNAME for WWW (Optional)**

   ```
   www.cedokamall.com → cedokamall.com
   ```

3. **MX Records (for Email)**
   ```
   Priority 10: mail.cedokamall.com
   Priority 20: mail2.cedokamall.com
   ```

### Step 4: SSL Certificate

**Automatic (Recommended):**

- Vercel: Automatic free SSL via Let's Encrypt
- Netlify: Automatic free SSL via Let's Encrypt
- AWS: Use AWS Certificate Manager

**Manual Setup:**

```bash
# Using Let's Encrypt
sudo certbot certonly --standalone -d cedokamall.com -d www.cedokamall.com

# Install certificate on nginx/Apache
```

### Step 5: Environment Configuration

**Create `.env.production`:**

```env
VITE_API_URL=https://api.cedokamall.com
VITE_APP_NAME=Cedokamall
VITE_APP_VERSION=1.0.0
VITE_ENV=production
VITE_ENABLE_FLASH_DEALS=true
VITE_ENABLE_LOYALTY_PROGRAM=true
VITE_ENABLE_SPIN_WHEEL=false
VITE_SESSION_TIMEOUT=3600000
VITE_TOKEN_EXPIRY=86400000
VITE_SECURE_COOKIES=true
VITE_HTTPS_ONLY=true
```

**In Hosting Platform (e.g., Vercel):**

1. Go to Project Settings
2. Environment Variables
3. Add each variable

### Step 6: Security Headers

**nginx.conf:**

```nginx
server {
  listen 443 ssl http2;
  server_name cedokamall.com;

  # SSL
  ssl_certificate /etc/letsencrypt/live/cedokamall.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/cedokamall.com/privkey.pem;

  # Security Headers
  add_header Strict-Transport-Security "max-age=31536000" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "DENY" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;

  # Gzip
  gzip on;
  gzip_types text/plain text/css application/json application/javascript;

  location / {
    root /usr/share/nginx/html;
    try_files $uri $uri/ /index.html;
  }
}

# Redirect HTTP to HTTPS
server {
  listen 80;
  server_name cedokamall.com;
  return 301 https://$server_name$request_uri;
}
```

### Step 7: Backend API Setup

Replace mock authentication with real API:

**Example Express.js Backend:**

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const jwt = require("jsonwebtoken");

const app = express();

// Security
app.use(helmet());
app.use(
  cors({
    origin: "https://cedokamall.com",
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(limiter);

// Routes
app.post("/api/admin/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate credentials
  const user = await User.findOne({ email });
  if (!user || !user.comparePassword(password)) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  // Create JWT
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" },
  );

  res.json({ token });
});

app.listen(process.env.PORT || 3000);
```

### Step 8: Database Setup

**MongoDB (if using):**

```bash
# Create cluster on MongoDB Atlas
# Connection string: mongodb+srv://user:pass@cluster.mongodb.net/cedokamall

# Create indexes
db.admins.createIndex({ email: 1 }, { unique: true });
db.flashDeals.createIndex({ createdAt: -1 });
db.products.createIndex({ category: 1 });
```

**PostgreSQL (if using):**

```sql
CREATE TABLE admins (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE flash_deals (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL,
  discount_percentage INTEGER NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  max_quantity INTEGER NOT NULL,
  current_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 📊 Monitoring & Analytics

### Set Up Monitoring

**Google Analytics:**

1. Create GA4 property
2. Add tracking code to `index.html`
3. Monitor: pageviews, bounce rate, conversions

**Sentry (Error Tracking):**

```bash
npm install @sentry/react

# Initialize in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: 'production'
});
```

**Server Monitoring:**

- Uptime: UptimeRobot, Pingdom
- Performance: New Relic, Datadog
- Errors: Sentry, LogRocket

### Performance Metrics

Track Core Web Vitals:

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 🔄 Continuous Deployment

### GitHub Actions

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

---

## 📱 Mobile & Responsive Testing

Before deploying, test on:

- iPhone 12/13/14/15
- iPad (portrait & landscape)
- Android devices
- Desktop (Windows, Mac)
- Tablets

Use:

- Chrome DevTools
- BrowserStack
- Responsive Design Checker

---

## 🆘 Rollback Procedure

If deployment fails:

```bash
# Vercel
vercel rollback

# Netlify
netlify deploy --prod --dir=dist # (redeploy previous version)

# Docker
docker run -p 80:80 cedokamall:previous-tag
```

---

## 📞 Support & Maintenance

### Daily Checks

- [ ] Website is accessible
- [ ] No console errors
- [ ] Admin dashboard works
- [ ] Products load correctly

### Weekly Checks

- [ ] Review analytics
- [ ] Check error tracking
- [ ] Review user feedback
- [ ] Monitor performance

### Monthly Checks

- [ ] Update dependencies
- [ ] Security audit
- [ ] Performance review
- [ ] Backup verification

---

## ✅ Post-Deployment

### Verification Checklist

- [ ] Frontend loads correctly
- [ ] Admin login works
- [ ] Dashboard displays stats
- [ ] Flash deals CRUD functional
- [ ] Mobile responsive
- [ ] Images load properly
- [ ] No console errors
- [ ] Analytics tracking
- [ ] SSL certificate valid
- [ ] HTTPS redirects working

### Submit to Search Engines

```bash
# Google Search Console
https://search.google.com/search-console

# Bing Webmaster Tools
https://www.bing.com/webmasters

# Submit sitemap:
sitemap.xml
```

### Set Up Backups

- Daily database backups
- Weekly full backups
- Store in multiple locations
- Test restore process monthly

---

## 🎯 Next Steps

1. **Implement Backend Authentication** - Replace mock login
2. **Set Up Database** - MongoDB or PostgreSQL
3. **Configure CI/CD** - GitHub Actions for auto-deploy
4. **Monitor Performance** - Set up analytics and error tracking
5. **Plan Scaling** - Database optimization, CDN, caching

---

**Status:** Production Ready  
**Last Updated:** April 17, 2026  
**Version:** 1.0.0
