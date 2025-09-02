# Architektura - Pramen života

Detailní popis architektury rezervačního systému pro centrum energetické rovnováhy.

## 🏗 Celková architektura

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS APPLICATION                      │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────── │
│  │   MARKETING     │  │     ADMIN       │  │     AUTH      │ │
│  │   (Public)      │  │   (Protected)   │  │  (Session)    │ │
│  └─────────────────┘  └─────────────────┘  └─────────────── │
├─────────────────────────────────────────────────────────────┤
│                    API LAYER (Route Handlers)              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────── │
│  │   PRISMA    │  │   PAYMENTS   │  │       EMAIL         │ │
│  │  (Database) │  │   (Stripe)   │  │   (Nodemailer)      │ │
│  └─────────────┘  └──────────────┘  └────────────────────── │
├─────────────────────────────────────────────────────────────┤
│                EXTERNAL SERVICES                           │
│  PostgreSQL  │  Stripe API  │  SMTP Server  │  File Storage │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Struktura složek

```
src/
├── app/                              # Next.js App Router
│   ├── (marketing)/                  # Veřejné stránky (layout group)
│   │   ├── layout.tsx                # Marketing layout
│   │   ├── page.tsx                  # Homepage
│   │   ├── kurzy/                    # Kurzy section
│   │   │   ├── page.tsx              # Seznam kurzů
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Detail kurzu + rezervace
│   │   ├── blog/                     # Blog section
│   │   │   ├── page.tsx              # Seznam článků
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # Detail článku
│   │   ├── galerie/
│   │   │   └── page.tsx              # Fotogalerie s lightbox
│   │   ├── kontakt/
│   │   │   └── page.tsx              # Kontaktní formulář
│   │   ├── o-nas/
│   │   │   └── page.tsx              # O centru
│   │   └── pravo/                    # Právní dokumenty
│   │       ├── gdpr/
│   │       ├── obchodni-podminky/
│   │       ├── cookies/
│   │       └── souhlas-s-focenim/
│   │
│   ├── (auth)/                       # Autentizace (layout group)
│   │   ├── login/
│   │   │   └── page.tsx              # Přihlášení
│   │   └── register/
│   │       └── page.tsx              # Registrace
│   │
│   ├── (admin)/                      # Admin panel (layout group)
│   │   ├── layout.tsx                # Admin layout s navigací
│   │   └── admin/
│   │       ├── page.tsx              # Dashboard
│   │       ├── kurzy/                # Správa kurzů
│   │       │   ├── page.tsx          # Seznam kurzů
│   │       │   ├── novy/             # Vytvoření kurzu
│   │       │   └── [id]/
│   │       │       ├── page.tsx      # Úprava kurzu
│   │       │       └── galerie/      # Galerie kurzu
│   │       ├── rezervace/            # Správa rezervací
│   │       │   ├── page.tsx          # Seznam rezervací
│   │       │   └── [id]/
│   │       │       └── page.tsx      # Detail rezervace
│   │       ├── blog/                 # Správa článků
│   │       │   ├── page.tsx          # Seznam článků
│   │       │   ├── novy/             # Nový článek
│   │       │   └── [id]/
│   │       │       └── page.tsx      # Úprava článku
│   │       ├── galerie/              # Správa galerie
│   │       │   └── page.tsx          # Upload & správa obrázků
│   │       └── nastaveni/            # Systémová nastavení
│   │           └── page.tsx          # Konfigurace
│   │
│   ├── rezervace/                    # Post-booking flow
│   │   └── [id]/
│   │       └── potvrzeni/
│   │           └── page.tsx          # Potvrzení rezervace
│   │
│   ├── api/                          # API Routes
│   │   ├── auth/                     # NextAuth endpoints
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts          # NextAuth configuration
│   │   ├── courses/                  # Kurzy API
│   │   │   ├── route.ts              # GET /api/courses
│   │   │   └── [id]/
│   │   │       └── route.ts          # GET/PUT/DELETE /api/courses/[id]
│   │   ├── reservations/             # Rezervace API
│   │   │   ├── route.ts              # POST /api/reservations
│   │   │   └── [id]/
│   │   │       ├── route.ts          # GET /api/reservations/[id]
│   │   │       └── confirmation/
│   │   │           └── route.ts      # GET confirmation data
│   │   ├── blog/                     # Blog API
│   │   │   └── posts/
│   │   │       ├── route.ts          # GET/POST /api/blog/posts
│   │   │       └── [id]/
│   │   │           └── route.ts      # GET/PUT/DELETE
│   │   ├── gallery/                  # Galerie API
│   │   │   └── route.ts              # GET/POST /api/gallery
│   │   ├── contact/                  # Kontaktní formulář
│   │   │   └── route.ts              # POST /api/contact
│   │   ├── admin/                    # Admin API
│   │   │   ├── dashboard/
│   │   │   │   └── route.ts          # GET dashboard stats
│   │   │   ├── reservations/
│   │   │   │   ├── route.ts          # GET admin reservations
│   │   │   │   └── export/
│   │   │   │       └── route.ts      # GET CSV export
│   │   │   └── settings/
│   │   │       └── route.ts          # GET/PUT settings
│   │   ├── payments/                 # Platební systém
│   │   │   └── create-checkout-session/
│   │   │       └── route.ts          # POST Stripe session
│   │   └── webhooks/                 # External webhooks
│   │       └── stripe/
│   │           └── route.ts          # POST Stripe webhook
│   │
│   ├── globals.css                   # Global styles
│   ├── layout.tsx                    # Root layout
│   ├── loading.tsx                   # Global loading UI
│   ├── not-found.tsx                 # 404 page
│   └── error.tsx                     # Error boundary
│
├── components/                       # React komponenty
│   ├── ui/                          # shadcn/ui generované komponenty
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── textarea.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── sheet.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   ├── toast.tsx
│   │   └── progress.tsx
│   │
│   ├── layout/                      # Layout komponenty
│   │   ├── header.tsx               # Hlavní navigace
│   │   ├── footer.tsx               # Footer s odkazy
│   │   ├── main-nav.tsx             # Navigační menu
│   │   ├── admin-nav.tsx            # Admin navigace
│   │   └── breadcrumbs.tsx          # Breadcrumb navigace
│   │
│   ├── marketing/                   # Homepage sekce
│   │   ├── hero.tsx                 # Hero sekce s CTA
│   │   ├── about.tsx                # O centru sekce
│   │   ├── courses-strip.tsx        # Top kurzy
│   │   ├── how-it-works.tsx         # Rezervační proces
│   │   ├── blog-strip.tsx           # Blog feed
│   │   ├── gallery-masonry.tsx      # Galerie preview
│   │   └── contact-cta.tsx          # Kontakt CTA
│   │
│   ├── courses/                     # Kurzy komponenty
│   │   ├── course-card.tsx          # Karta kurzu
│   │   ├── course-filters.tsx       # Filtrování kurzů
│   │   ├── course-grid.tsx          # Grid layout
│   │   ├── reservation-form.tsx     # Rezervační formulář
│   │   ├── capacity-indicator.tsx   # Ukazatel kapacity
│   │   └── course-gallery.tsx       # Galerie kurzu
│   │
│   ├── blog/                        # Blog komponenty
│   │   ├── post-card.tsx            # Karta článku
│   │   ├── post-grid.tsx            # Grid článků
│   │   ├── post-content.tsx         # Obsah článku (MD)
│   │   ├── related-posts.tsx        # Související články
│   │   └── tag-filter.tsx           # Filtr podle tagů
│   │
│   ├── gallery/                     # Galerie komponenty
│   │   ├── masonry-grid.tsx         # Masonry layout
│   │   ├── lightbox.tsx             # Lightbox viewer
│   │   ├── image-card.tsx           # Karta obrázku
│   │   └── category-filter.tsx      # Filtr kategorií
│   │
│   ├── forms/                       # Formulářové komponenty
│   │   ├── contact-form.tsx         # Kontaktní formulář
│   │   ├── newsletter-form.tsx      # Newsletter signup
│   │   ├── course-form.tsx          # Admin - úprava kurzu
│   │   ├── post-form.tsx            # Admin - úprava článku
│   │   └── field-components/        # Reusable form fields
│   │
│   ├── admin/                       # Admin komponenty
│   │   ├── dashboard-stats.tsx      # Dashboard metriky
│   │   ├── reservations-table.tsx   # Tabulka rezervací
│   │   ├── courses-table.tsx        # Tabulka kurzů
│   │   ├── data-export.tsx          # CSV export
│   │   └── settings-form.tsx        # Nastavení systému
│   │
│   └── common/                      # Společné komponenty
│       ├── container.tsx            # Layout container
│       ├── wavy-separator.tsx       # SVG vlnky
│       ├── loading-spinner.tsx      # Loading indikátor
│       ├── error-boundary.tsx       # Error handling
│       ├── seo-head.tsx             # Meta tags
│       ├── cookie-banner.tsx        # GDPR cookies
│       └── back-to-top.tsx          # Scroll to top
│
├── lib/                             # Utility knihovny
│   ├── prisma.ts                    # Prisma client singleton
│   ├── auth.ts                      # NextAuth konfigurace
│   ├── utils.ts                     # Obecné utility (cn, atd.)
│   │
│   ├── validators/                  # Zod validation schémata
│   │   ├── course.ts                # Kurz validace
│   │   ├── reservation.ts           # Rezervace validace
│   │   ├── post.ts                  # Článek validace
│   │   ├── contact.ts               # Kontakt validace
│   │   └── user.ts                  # Uživatel validace
│   │
│   ├── payments/                    # Platební systém
│   │   ├── PaymentProvider.ts       # Interface pro payment providery
│   │   ├── stripe.ts                # Stripe implementace
│   │   ├── comgate.ts               # Comgate implementace (připraveno)
│   │   └── mock.ts                  # Mock provider pro testy
│   │
│   ├── mailer/                      # E-mail systém
│   │   ├── client.ts                # Nodemailer client
│   │   ├── templates/               # E-mail šablony
│   │   │   ├── reservation-confirmation.ts
│   │   │   ├── contact-form.ts
│   │   │   └── course-reminder.ts
│   │   └── sendReservationEmail.ts  # Rezervační e-maily
│   │
│   ├── upload/                      # File upload
│   │   ├── local.ts                 # Lokální storage
│   │   ├── s3.ts                    # S3 storage (připraveno)
│   │   └── types.ts                 # Upload types
│   │
│   ├── seo/                         # SEO utility
│   │   ├── meta.ts                  # Meta tags generování
│   │   ├── sitemap.ts               # Sitemap generování
│   │   └── structured-data.ts       # JSON-LD schema
│   │
│   └── format/                      # Formátovací funkce
│       ├── currency.ts              # CZK formátování
│       ├── date.ts                  # České datum/čas
│       └── text.ts                  # Text utility
│
├── hooks/                           # Custom React hooks
│   ├── useAuth.ts                   # Autentizace hook
│   ├── useReservation.ts            # Rezervace workflow
│   ├── useCourses.ts                # Kurzy data fetching
│   ├── usePagination.ts             # Stránkování logika
│   └── useLocalStorage.ts           # Local storage hook
│
├── styles/                          # Styly
│   └── globals.css                  # Tailwind + custom CSS
│
├── types/                           # TypeScript typy
│   ├── database.ts                  # Prisma generated types
│   ├── api.ts                       # API response types
│   ├── auth.ts                      # Autentizace types
│   └── global.ts                    # Globální types
│
└── middleware.ts                    # Next.js middleware (auth protection)
```

## 🔄 Data Flow

### 1. Rezervační proces
```
User Input (Form) 
    ↓
Client-side Validation (React Hook Form + Zod)
    ↓
API Call (/api/reservations)
    ↓
Server-side Validation (Zod)
    ↓
Capacity Check (Prisma)
    ↓
Create Reservation (PENDING)
    ↓
Create Stripe Checkout Session
    ↓
Redirect to Stripe
    ↓
Payment Success/Fail
    ↓
Stripe Webhook (/api/webhooks/stripe)
    ↓
Update Reservation (PAID)
    ↓
Send Confirmation Email
    ↓
Redirect to Confirmation Page
```

### 2. Admin workflow
```
Admin Login (NextAuth)
    ↓
Middleware Check (role: ADMIN)
    ↓
Admin Dashboard (/admin)
    ↓
CRUD Operations (API calls)
    ↓
Optimistic Updates (React Query/SWR)
    ↓
Database Mutations (Prisma)
    ↓
Revalidate Cache (Next.js ISR)
```

### 3. SEO & Performance flow
```
Page Request
    ↓
Server-side Data Fetching (React Suspense)
    ↓
Generate Meta Tags (next-seo)
    ↓
Render Page (SSR/ISR)
    ↓
Client Hydration
    ↓
Progressive Enhancement (JS)
    ↓
Lazy Load Images (next/image)
    ↓
Prefetch Links (next/link)
```

## 🔐 Security Architecture

### Authentication Flow
```
Login Form → NextAuth → Database Lookup → JWT Token → HTTP-only Cookie → Session Middleware
```

### Authorization Layers
1. **Middleware** - Route protection na úrovni Next.js
2. **API Guards** - Ověření session v API handlers
3. **Database Policies** - Row-level security (RLS) v PostgreSQL
4. **Component Guards** - Conditional rendering dle role

### Security Headers
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy.replace(/\\s{2,}/g, ' ').trim()
  }
];
```

## ⚡ Performance Strategy

### Next.js Optimizations
- **App Router** s Server Components
- **Incremental Static Regeneration** (ISR) pro kurzy
- **Edge Runtime** pro API routes kde možné
- **Image Optimization** s next/image
- **Bundle Analysis** s @next/bundle-analyzer

### Database Optimizations
- **Connection Pooling** s Prisma
- **Database Indexing** na často dotazované sloupce
- **Query Optimization** s includes/selects
- **Caching Strategy** s Redis (připraveno)

### Frontend Performance
- **Code Splitting** automaticky s Next.js
- **Lazy Loading** pro komponenty pod fold
- **Prefetching** kritických routes
- **Service Worker** pro offline functionality

## 🔌 Integration Points

### External Services
```typescript
interface ExternalServices {
  payments: {
    stripe: StripeConfig;
    comgate: ComgateConfig;
  };
  email: {
    smtp: SMTPConfig;
    resend?: ResendConfig;
  };
  storage: {
    local: LocalStorageConfig;
    s3?: S3Config;
  };
  monitoring: {
    sentry?: SentryConfig;
    analytics?: GoogleAnalyticsConfig;
  };
}
```

### Webhook Handling
```typescript
// Stripe webhooks
POST /api/webhooks/stripe
  - checkout.session.completed
  - payment_intent.succeeded
  - invoice.payment_failed

// Future integrations
POST /api/webhooks/comgate
POST /api/webhooks/cms (pro standalone modul)
```

## 📱 Responsive Design Strategy

### Breakpoints (Tailwind CSS)
```css
/* Mobile first approach */
sm: '640px'   /* Mobile landscape */
md: '768px'   /* Tablet */
lg: '1024px'  /* Desktop */
xl: '1280px'  /* Large desktop */
2xl: '1536px' /* Extra large */
```

### Component Adaptivity
- **Grid Systems** - 1 col mobile → 2 col tablet → 3-4 col desktop
- **Navigation** - Hamburger menu → horizontal nav
- **Cards** - Stack mobile → grid desktop
- **Forms** - Single column → multi-column

## 🧪 Testing Architecture

### Test Layers
```
├── Unit Tests (Jest + Testing Library)
├── Integration Tests (API routes)
├── E2E Tests (Playwright)
└── Visual Regression Tests (Chromatic)
```

### Test Organization
```
__tests__/
├── components/          # Component tests
├── api/                # API endpoint tests  
├── pages/              # Page component tests
├── lib/                # Utility function tests
├── e2e/                # End-to-end tests
├── fixtures/           # Test data
└── utils/              # Test utilities
```

## 🚀 Deployment Architecture

### Environment Stages
```
Development → Staging → Production
    ↓           ↓          ↓
Local DB    Test DB    Prod DB
Mock Stripe Test Stripe Live Stripe
```

### Infrastructure
- **Hosting**: Vercel/AWS/Digital Ocean
- **Database**: Managed PostgreSQL (AWS RDS/Supabase)
- **CDN**: Vercel Edge Network/CloudFlare
- **Monitoring**: Sentry + Custom metrics

---

Tato architektura poskytuje škálovatelný, bezpečný a výkonný základ pro rezervační systém centra energetické rovnováhy s možností rozšíření o další funkcionality.