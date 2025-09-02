# Deployment Guide - Pramen života

Kompletní návod pro nasazení rezervačního systému centra energetické rovnováhy do produkce.

## 🚀 Přehled deployment možností

### Doporučené hosting platformy

1. **Vercel** (doporučeno) - Nativní Next.js podpora
2. **Netlify** - JAMstack optimalizace  
3. **AWS** - Enterprise řešení
4. **DigitalOcean App Platform** - Výkonné a cenově dostupné
5. **Railway** - Developer-friendly

## 🔧 Environment Setup

### Produkční environment variables

```bash
# .env.production
NODE_ENV=production

# Database
DATABASE_URL="postgresql://user:password@host:5432/pramen_zivota_prod"

# NextAuth
NEXTAUTH_SECRET="super-secure-secret-min-32-characters"
NEXTAUTH_URL="https://pramenzivota.cz"

# Payment - Stripe Live
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLIC_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Payment - ComGate Live
COMGATE_MERCHANT_ID="your_live_merchant_id"
COMGATE_SECRET_KEY="your_live_secret_key"
COMGATE_WEBHOOK_SECRET="your_live_webhook_secret"
DEFAULT_PAYMENT_PROVIDER="comgate"

# Email
EMAIL_FROM="noreply@pramenzivota.cz"
SMTP_HOST="smtp.yourmailserver.com"
SMTP_PORT=587
SMTP_USER="noreply@pramenzivota.cz"
SMTP_PASS="your_email_password"

# Application
APP_BASE_URL="https://pramenzivota.cz"
NEXT_PUBLIC_APP_NAME="Pramen života s.r.o."

# File Storage (optional)
AWS_S3_BUCKET="pramen-zivota-uploads"
AWS_ACCESS_KEY_ID="your_access_key"
AWS_SECRET_ACCESS_KEY="your_secret_key"
AWS_REGION="eu-west-1"

# Monitoring (optional)
SENTRY_DSN="https://your-sentry-dsn"
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID="GA_MEASUREMENT_ID"
```

## 🗄 Database Setup

### PostgreSQL na produkci

#### Možnost 1: Managed PostgreSQL (doporučeno)

**Supabase:**
```bash
# Vytvoření projektu na https://supabase.com
# Zkopírování connection stringu
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"
```

**AWS RDS:**
```bash
# Vytvoření RDS instance
aws rds create-db-instance \
  --db-instance-identifier pramen-zivota-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --allocated-storage 20 \
  --master-username pramen_admin \
  --master-user-password [STRONG_PASSWORD] \
  --vpc-security-group-ids sg-xxxxxxxxx
```

**DigitalOcean Managed Database:**
```bash
# Vytvoření přes web UI nebo API
doctl databases create pramen-zivota-db \
  --engine postgres \
  --region fra1 \
  --size db-s-1vcpu-1gb
```

#### Možnost 2: Self-hosted PostgreSQL

**Docker setup:**
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: pramen_zivota
      POSTGRES_USER: pramen_admin
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    ports:
      - "5432:5432"
    restart: unless-stopped

volumes:
  postgres_data:
```

### Database migrace

```bash
# Produkční migrace
DATABASE_URL="your_production_url" npx prisma migrate deploy

# Generování klienta
DATABASE_URL="your_production_url" npx prisma generate

# Seed produkčních dat (pouze při první instalaci)
DATABASE_URL="your_production_url" npm run prisma:seed:prod
```

### Backup strategie

```bash
#!/bin/bash
# scripts/backup-db.sh

DB_URL="your_production_database_url"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Vytvoření backupu
pg_dump $DB_URL > $BACKUP_DIR/pramen_zivota_$DATE.sql

# Komprese
gzip $BACKUP_DIR/pramen_zivota_$DATE.sql

# Smazání starých backupů (starších než 30 dní)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: pramen_zivota_$DATE.sql.gz"
```

## 🔗 Vercel Deployment (doporučeno)

### 1. Příprava projektu

```bash
# Instalace Vercel CLI
npm install -g vercel

# Login
vercel login
```

### 2. Vercel konfigurace

`vercel.json`:
```json
{
  "name": "pramen-zivota",
  "version": 2,
  "regions": ["fra1"],
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  },
  "functions": {
    "src/app/api/**/*": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ]
}
```

### 3. Environment variables setup

```bash
# Nastavení přes Vercel CLI
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add STRIPE_SECRET_KEY production
# ... všechny další proměnné
```

### 4. Deployment

```bash
# Preview deployment
vercel

# Produkční deployment
vercel --prod

# Automatické deployment přes GitHub
# Propojte repository na https://vercel.com
```

## 🐳 Docker Deployment

### Dockerfile

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose pro produkci

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
      - NEXTAUTH_URL=${NEXTAUTH_URL}
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: pramen_zivota
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - app
    restart: unless-stopped

volumes:
  postgres_data:
```

### Nginx konfigurace

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name pramenzivota.cz www.pramenzivota.cz;
        return 301 https://$server_name$request_uri;
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name pramenzivota.cz www.pramenzivota.cz;

        ssl_certificate /etc/ssl/cert.pem;
        ssl_certificate_key /etc/ssl/key.pem;
        ssl_session_timeout 1d;
        ssl_session_cache shared:MozTLS:10m;
        ssl_session_tickets off;

        # Security headers
        add_header Strict-Transport-Security "max-age=63072000" always;
        add_header X-Frame-Options DENY always;
        add_header X-Content-Type-Options nosniff always;

        # Gzip compression
        gzip on;
        gzip_vary on;
        gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # Static files caching
        location /_next/static/ {
            proxy_pass http://app;
            add_header Cache-Control "public, max-age=31536000, immutable";
        }

        # Images caching
        location ~* \.(jpg|jpeg|png|gif|ico|svg)$ {
            proxy_pass http://app;
            add_header Cache-Control "public, max-age=31536000";
        }
    }
}
```

## 🌐 AWS Deployment

### AWS Amplify

```yaml
# amplify.yml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npx prisma generate
        - npm run build
  artifacts:
    baseDirectory: .next
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
      - .next/cache/**/*
```

### AWS ECS + Fargate

```yaml
# docker-compose.aws.yml
version: '3.8'
services:
  app:
    image: your-ecr-repo/pramen-zivota:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    logging:
      driver: awslogs
      options:
        awslogs-group: /ecs/pramen-zivota
        awslogs-region: eu-west-1
        awslogs-stream-prefix: ecs
```

## 💾 File Storage Setup

### Místní storage (development/malé produkce)

```typescript
// src/lib/upload/local.ts
export const uploadConfig = {
  local: {
    uploadDir: './public/uploads',
    publicPath: '/uploads',
    maxFileSize: 5 * 1024 * 1024, // 5MB
  }
};
```

### AWS S3 (doporučeno pro produkci)

```typescript
// src/lib/upload/s3.ts
import { S3Client } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export const s3Config = {
  bucket: process.env.AWS_S3_BUCKET!,
  region: process.env.AWS_REGION!,
  cloudFrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN,
};
```

## 📧 Email Configuration

### SMTP providers

**Sendgrid:**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

**Amazon SES:**
```env
SMTP_HOST=email-smtp.eu-west-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your_ses_smtp_username
SMTP_PASS=your_ses_smtp_password
```

**Czech providers:**
```env
# Wedos
SMTP_HOST=smtp.wedos.net
SMTP_PORT=587

# Forpsi
SMTP_HOST=smtp.forpsi.com
SMTP_PORT=587
```

## 🔐 SSL Certificate Setup

### Let's Encrypt (free)

```bash
# Instalace Certbot
sudo apt install certbot python3-certbot-nginx

# Získání certifikátu
sudo certbot --nginx -d pramenzivota.cz -d www.pramenzivota.cz

# Automatické obnovení
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### CloudFlare (doporučeno)

1. Přidejte doménu do CloudFlare
2. Změňte DNS servery
3. Aktivujte SSL/TLS encryption
4. Nastavte "Full (strict)" mode

## 📊 Monitoring & Logging

### Sentry Error Tracking

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  beforeSend(event) {
    // Filtrování citlivých dat
    if (event.exception) {
      const error = event.exception.values?.[0];
      if (error?.value?.includes('password')) {
        return null;
      }
    }
    return event;
  },
});
```

### Uptime monitoring

```bash
# Healthcheck endpoint
curl -f https://pramenzivota.cz/api/health || exit 1
```

`src/app/api/health/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Database health check
    await prisma.$queryRaw`SELECT 1`;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'ok',
        email: 'ok',
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
```

## 🚀 CI/CD Pipeline

### GitHub Actions

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
        
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run test
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

### Database migrations v CI/CD

```yaml
- name: Run database migrations
  run: |
    npx prisma migrate deploy
    npx prisma generate
  env:
    DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## ⚡ Performance Optimizations

### Next.js production config

```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: [
      'images.unsplash.com',
      's3.amazonaws.com',
      'd3some-cloudfront-domain.net',
    ],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  swcMinify: true,
  poweredByHeader: false,
  generateEtags: false,
  
  async headers() {
    return [
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### CDN Setup

```typescript
// Cloudflare Workers pro custom cache
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const cacheKey = new Request(request.url, request);
  const cache = caches.default;
  
  // Check cache first
  let response = await cache.match(cacheKey);
  
  if (!response) {
    // Fetch from origin
    response = await fetch(request);
    
    // Cache static assets
    if (request.url.includes('/_next/static/')) {
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Cache-Control', 'public, max-age=31536000');
      
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
      
      event.waitUntil(cache.put(cacheKey, response.clone()));
    }
  }
  
  return response;
}
```

## 🔒 Security Checklist

### Pre-deployment security

- [ ] Environment variables jsou nastaveny bezpečně
- [ ] Database používá SSL připojení
- [ ] HTTPS je vynuceno na všech endpointech
- [ ] Rate limiting je aktivní na API
- [ ] CSRF ochrana je zapnutá
- [ ] Security headers jsou nastaveny
- [ ] Citlivé soubory (.env, atd.) jsou v .gitignore
- [ ] Admin routes jsou chráněny middleware
- [ ] File uploads jsou validovány
- [ ] SQL injection ochrana (Prisma)

### Post-deployment monitoring

- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] Security scanning
- [ ] Regular backups
- [ ] Log aggregation

## 📋 Launch Checklist

### Před spuštěním

- [ ] Domain registrace a DNS nastavení
- [ ] SSL certifikát instalován
- [ ] Database migrace dokončeny
- [ ] Payment provider (Stripe/Comgate) nakonfigurován v live režimu
- [ ] Webhooks URL nastaveny u payment providera
- [ ] SMTP server nakonfigurován a otestován
- [ ] Všechny environment variables nastaveny
- [ ] Backup strategie implementována
- [ ] Monitoring nastaven

### Po spuštění

- [ ] Základní funkcionalita otestována
- [ ] Rezervační proces otestován end-to-end
- [ ] Email notifikace fungují
- [ ] Admin panel přístupný
- [ ] SEO meta tags ověřeny
- [ ] Google Analytics/monitoring připojen
- [ ] Sitemap.xml vygenerován a odeslán do Google Search Console

### Maintenance

- [ ] Pravidelné security updates
- [ ] Database backup monitoring
- [ ] Performance monitoring
- [ ] User feedback collection
- [ ] Regular content updates

---

Tento deployment guide pokrývá všechny aspekty nasazení rezervačního systému do produkčního prostředí s důrazem na bezpečnost, výkonnost a spolehlivost.