# Implementační guide - Pramen života

Postupný návod pro vytvoření rezervačního systému centrum energetické rovnováhy od základů po produkční nasazení.

## 🚀 Fáze 1: Projekt Setup (1-2 dny)

### 1.1 Inicializace Next.js projektu

```bash
# Vytvoření projektu
npx create-next-app@latest pramen-zivota \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*"

cd pramen-zivota
```

### 1.2 Instalace základních závislostí

```bash
# Core dependencies
npm install \
  prisma @prisma/client \
  @auth-js/prisma-adapter \
  next-auth \
  @hookform/resolvers \
  react-hook-form \
  zod \
  bcryptjs \
  nodemailer \
  stripe \
  framer-motion \
  lucide-react \
  next-seo \
  next-sitemap

# Development dependencies
npm install -D \
  @types/bcryptjs \
  @types/nodemailer \
  prisma \
  eslint-config-prettier \
  prettier \
  @tailwindcss/typography \
  @tailwindcss/forms
```

### 1.3 Konfigurace shadcn/ui

```bash
# Inicializace shadcn/ui
npx shadcn-ui@latest init

# Instalace základních komponent
npx shadcn-ui@latest add \
  button card badge input textarea select \
  dialog sheet breadcrumb tabs table toast \
  progress dropdown-menu avatar
```

### 1.4 Environment setup

```bash
# Vytvoření .env.local
cp .env.example .env.local

# Úprava .env.local s vlastními hodnotami
DATABASE_URL="postgresql://username:password@localhost:5432/pramen_zivota"
NEXTAUTH_SECRET="váš-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
# ... další proměnné
```

### 1.5 Tailwind konfigurace

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B6FD8',
          dark: '#1557B8',
        },
        nature: {
          light: '#A7D7C5',
          DEFAULT: '#8BC4A8',
        },
        gray: {
          text: '#1F2937',
          light: '#4B5563',
          separator: '#F3F4F6',
        }
      },
      fontFamily: {
        serif: ['Playfair Display', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
      }
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
}

export default config
```

## 🗄 Fáze 2: Database Setup (1 den)

### 2.1 Prisma konfigurace

```bash
# Inicializace Prisma
npx prisma init
```

Vytvořte `prisma/schema.prisma` podle dokumentace v `docs/database.md`.

### 2.2 Database migrace

```bash
# První migrace
npx prisma migrate dev --name init

# Generování klienta
npx prisma generate
```

### 2.3 Seed data

Vytvořte `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Vytvoření admin uživatele
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pramenzivota.cz' },
    update: {},
    create: {
      email: 'admin@pramenzivota.cz',
      passwordHash: adminPassword,
      name: 'Systémový administrátor',
      role: 'ADMIN',
    },
  });

  // Kurzy
  const courses = await Promise.all([
    prisma.course.create({
      data: {
        slug: 'hatha-yoga-pro-zacatecniky',
        title: 'Hatha Yoga pro začátečníky',
        shortDescription: 'Jemný úvod do světa jógy zaměřený na základní pozice a dýchání',
        description: `# Hatha Yoga pro začátečníky
        
Tento kurz je určen všem, kteří se chtějí seznámit se základy hatha jógy v klidném a podporujícím prostředí.

## Co vás čeká:
- Základní jógové pozice (ásány)
- Dechové techniky (pránájáma)  
- Relaxační techniky
- Úvod do meditace

Kurz je vhodný pro úplné začátečníky i mírně pokročilé.`,
        startDate: new Date('2024-04-15T18:00:00'),
        endDate: new Date('2024-04-15T19:30:00'),
        location: 'Studio Pramen života, Vinohrady, Praha',
        capacity: 12,
        priceCZK: 50000, // 500 CZK
        coverImageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
        tags: ['hatha-yoga', 'zacatecnici', 'dychani'],
        status: 'PUBLISHED',
        featured: true,
      },
    }),
    // ... další kurzy
  ]);

  // Galerie obrázky
  const galleryImages = await Promise.all([
    prisma.galleryImage.create({
      data: {
        url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80',
        alt: 'Jóga v přírodě',
        category: 'kurzy',
        tags: ['joga', 'priroda'],
        featured: true,
      },
    }),
    // ... další obrázky
  ]);

  // Právní stránky
  const legalPages = await Promise.all([
    prisma.legalPage.create({
      data: {
        slug: 'gdpr',
        title: 'Ochrana osobních údajů (GDPR)',
        content: `# Ochrana osobních údajů
        
V souladu s nařízením GDPR vás informujeme o zpracování vašich osobních údajů...`,
      },
    }),
    // ... další právní stránky
  ]);

  console.log('✅ Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

```bash
# Spuštění seedu
npm run prisma:seed
```

## 🔐 Fáze 3: Autentizace (0.5 dne)

### 3.1 NextAuth konfigurace

Vytvořte `src/lib/auth.ts`:

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth-js/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        session.user.id = token.sub;
        session.user.role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
};
```

### 3.2 Middleware pro ochranu routes

Vytvořte `src/middleware.ts`:

```typescript
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(req) {
    // Additional middleware logic
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Ochrana admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN';
        }
        
        // Ostatní protected routes
        if (req.nextUrl.pathname.startsWith('/profile')) {
          return !!token;
        }
        
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
```

## 🎨 Fáze 4: Layout a komponenty (2-3 dny)

### 4.1 Root layout

`src/app/layout.tsx`:

```typescript
import { Inter, Playfair_Display } from 'next/font/google';
import { Providers } from '@/components/providers';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata = {
  title: 'Pramen života s.r.o. | Centrum energetické rovnováhy',
  description: 'Centrum energetické rovnováhy specializující se na kurzy jógy, meditace a wellness.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className={`${inter.variable} ${playfair.variable}`}>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
```

### 4.2 Hlavní komponenty

Vytvořte postupně:
- `src/components/layout/header.tsx` - hlavní navigace
- `src/components/layout/footer.tsx` - footer s odkazy
- `src/components/marketing/hero.tsx` - hero sekce
- `src/components/common/wavy-separator.tsx` - SVG separátory

### 4.3 Homepage

`src/app/(marketing)/page.tsx`:

```typescript
import { Hero } from '@/components/marketing/hero';
import { AboutSection } from '@/components/marketing/about';
import { CoursesStrip } from '@/components/marketing/courses-strip';
import { HowItWorks } from '@/components/marketing/how-it-works';
import { BlogStrip } from '@/components/marketing/blog-strip';
import { GalleryMasonry } from '@/components/marketing/gallery-masonry';
import { ContactCTA } from '@/components/marketing/contact-cta';

export default async function HomePage() {
  return (
    <main>
      <Hero />
      <AboutSection />
      <CoursesStrip />
      <HowItWorks />
      <BlogStrip />
      <GalleryMasonry />
      <ContactCTA />
    </main>
  );
}
```

## 🔗 Fáze 5: API Routes (2 dny)

### 5.1 Základní API struktura

Vytvořte postupně API routes podle `docs/api.md`:

- `/api/courses` - kurzy CRUD
- `/api/reservations` - rezervace workflow
- `/api/blog/posts` - blog CRUD
- `/api/contact` - kontaktní formulář

### 5.2 Příklad: Courses API

`src/app/api/courses/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const coursesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(['PUBLISHED', 'DRAFT', 'CANCELLED']).optional(),
  featured: z.coerce.boolean().optional(),
  tags: z.string().optional(),
  search: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = coursesQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      status: searchParams.get('status'),
      featured: searchParams.get('featured'),
      tags: searchParams.get('tags'),
      search: searchParams.get('search'),
    });

    const skip = (query.page - 1) * query.limit;

    const where = {
      ...(query.status && { status: query.status }),
      ...(query.featured !== undefined && { featured: query.featured }),
      ...(query.tags && { tags: { hasSome: query.tags.split(',') } }),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { shortDescription: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: query.limit,
        orderBy: [
          { featured: 'desc' },
          { startDate: 'asc' },
        ],
        include: {
          _count: {
            select: {
              reservations: {
                where: { status: 'PAID' },
              },
            },
          },
        },
      }),
      prisma.course.count({ where }),
    ]);

    return NextResponse.json({
      courses,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    });
  } catch (error) {
    console.error('Courses API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 💳 Fáze 6: Platební systém (2 dny)

### 6.1 Stripe konfigurace

`src/lib/payments/stripe.ts`:

```typescript
import Stripe from 'stripe';
import { PaymentProvider } from './PaymentProvider';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export class StripeProvider implements PaymentProvider {
  async createCheckoutSession({
    reservationId,
    courseId,
    amountCZK,
    customerEmail,
  }: {
    reservationId: string;
    courseId: string;
    amountCZK: number;
    customerEmail: string;
  }) {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'czk',
            product_data: {
              name: 'Rezervace kurzu',
            },
            unit_amount: amountCZK,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXTAUTH_URL}/rezervace/${reservationId}/potvrzeni?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/kurzy`,
      metadata: {
        reservationId,
        courseId,
      },
    });

    return {
      sessionId: session.id,
      paymentUrl: session.url!,
    };
  }
}
```

### 6.2 Webhook handler

`src/app/api/webhooks/stripe/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';
import { sendReservationConfirmationEmail } from '@/lib/mailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const reservationId = session.metadata?.reservationId;

    if (!reservationId) {
      return NextResponse.json({ error: 'Missing reservation ID' }, { status: 400 });
    }

    try {
      // Update reservation status
      const reservation = await prisma.reservation.update({
        where: { id: reservationId },
        data: {
          status: 'PAID',
          paymentRef: session.id,
          amountCZK: session.amount_total,
        },
        include: {
          Course: true,
        },
      });

      // Send confirmation email
      await sendReservationConfirmationEmail(reservation);

      console.log(`Reservation ${reservationId} marked as PAID`);
    } catch (error) {
      console.error('Error updating reservation:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
```

## 📧 Fáze 7: Email systém (1 den)

### 7.1 Nodemailer setup

`src/lib/mailer/client.ts`:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export { transporter };
```

### 7.2 Email šablony

`src/lib/mailer/templates/reservation-confirmation.ts`:

```typescript
import { Reservation, Course } from '@prisma/client';
import { formatCurrencyCZK, formatDateCZ } from '@/lib/format';

export function generateReservationConfirmationEmail(
  reservation: Reservation & { Course: Course }
) {
  const { fullName, Course: course } = reservation;

  const subject = `Potvrzení rezervace: ${course.title}`;

  const htmlContent = `
    <h1>Děkujeme za rezervaci!</h1>
    
    <p>Milý/á ${fullName},</p>
    
    <p>Vaše rezervace byla úspěšně zaplacena a potvrzena.</p>
    
    <h2>Detail kurzu:</h2>
    <ul>
      <li><strong>Název:</strong> ${course.title}</li>
      <li><strong>Datum:</strong> ${formatDateCZ(course.startDate)}</li>
      <li><strong>Místo:</strong> ${course.location}</li>
      <li><strong>Cena:</strong> ${formatCurrencyCZK(course.priceCZK)}</li>
    </ul>
    
    <p>Těšíme se na vás!</p>
    <p>Tým Pramen života</p>
  `;

  const textContent = `
    Děkujeme za rezervaci!
    
    Milý/á ${fullName},
    
    Vaše rezervace byla úspěšně zaplacena a potvrzena.
    
    Detail kurzu:
    - Název: ${course.title}
    - Datum: ${formatDateCZ(course.startDate)}
    - Místo: ${course.location}
    - Cena: ${formatCurrencyCZK(course.priceCZK)}
    
    Těšíme se na vás!
    Tým Pramen života
  `;

  return { subject, htmlContent, textContent };
}
```

## 🏠 Fáze 8: Admin panel (3-4 dny)

### 8.1 Admin layout

`src/app/(admin)/layout.tsx`:

```typescript
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AdminNav } from '@/components/admin/admin-nav';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <AdminNav />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6">
          {children}
        </div>
      </main>
    </div>
  );
}
```

### 8.2 Dashboard

`src/app/(admin)/admin/page.tsx`:

```typescript
import { prisma } from '@/lib/prisma';
import { DashboardStats } from '@/components/admin/dashboard-stats';
import { RecentReservations } from '@/components/admin/recent-reservations';

async function getDashboardData() {
  const [totalCourses, totalReservations, monthlyRevenue] = await Promise.all([
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
    prisma.reservation.count({ where: { status: 'PAID' } }),
    prisma.reservation.aggregate({
      where: {
        status: 'PAID',
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
      _sum: { amountCZK: true },
    }),
  ]);

  return {
    totalCourses,
    totalReservations,
    monthlyRevenue: monthlyRevenue._sum.amountCZK || 0,
  };
}

export default async function AdminDashboard() {
  const stats = await getDashboardData();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <DashboardStats stats={stats} />
      <RecentReservations />
    </div>
  );
}
```

### 8.3 CRUD komponenty

Postupně implementujte:
- Správa kurzů (`/admin/kurzy`)
- Správa rezervací (`/admin/rezervace`)
- Blog editor (`/admin/blog`)
- Galerie management (`/admin/galerie`)

## 🔧 Fáze 9: SEO a optimalizace (1 den)

### 9.1 Meta tags a SEO

`src/lib/seo/meta.ts`:

```typescript
import { Metadata } from 'next';

export function generateMetadata(
  title: string,
  description: string,
  image?: string,
  url?: string
): Metadata {
  return {
    title: `${title} | Pramen života s.r.o.`,
    description,
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : [],
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : [],
    },
  };
}
```

### 9.2 Sitemap generace

`next-sitemap.config.js`:

```javascript
/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXTAUTH_URL || 'https://pramenzivota.cz',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/api/*'],
  additionalPaths: async (config) => [
    await config.transform(config, '/kurzy'),
    await config.transform(config, '/blog'),
    await config.transform(config, '/galerie'),
  ],
};
```

## 🧪 Fáze 10: Testování (2 dny)

### 10.1 Jest setup

`jest.config.js`:

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = createJestConfig(customJestConfig);
```

### 10.2 Příklad testů

`__tests__/components/course-card.test.tsx`:

```typescript
import { render, screen } from '@testing-library/react';
import { CourseCard } from '@/components/courses/course-card';

const mockCourse = {
  id: '1',
  slug: 'test-course',
  title: 'Test Course',
  shortDescription: 'Test description',
  startDate: new Date('2024-04-15'),
  location: 'Test Location',
  capacity: 10,
  priceCZK: 50000,
  coverImageUrl: 'https://example.com/image.jpg',
  tags: ['test'],
  stats: {
    reservedSeats: 5,
    availableSeats: 5,
    occupancyPercent: 50,
    isFullyBooked: false,
  },
};

describe('CourseCard', () => {
  it('renders course information correctly', () => {
    render(<CourseCard course={mockCourse} />);
    
    expect(screen.getByText('Test Course')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('500 Kč')).toBeInTheDocument();
  });
});
```

## 🚀 Fáze 11: Deployment (1 den)

### 11.1 Vercel deployment

```bash
# Instalace Vercel CLI
npm install -g vercel

# Login a deploy
vercel login
vercel

# Produkční deployment
vercel --prod
```

### 11.2 Environment variables na Vercel

Nastavte všechny potřebné environment proměnné:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `SMTP_*` proměnné

### 11.3 Database migrace na produkci

```bash
# Deploy database changes
npx prisma db push

# Seed produkční data
npx prisma db seed
```

## ⚡ Fáze 12: Performance optimalizace

### 12.1 Next.js optimalizace

`next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
  },
  images: {
    domains: ['images.unsplash.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  swcMinify: true,
};

module.exports = nextConfig;
```

### 12.2 Bundle analysis

```bash
# Instalace bundle analyzeru
npm install -D @next/bundle-analyzer

# Analýza bundlů
npm run analyze
```

## 📊 Monitoring a maintenance

### 12.3 Error tracking (Sentry)

```bash
npm install @sentry/nextjs
```

`sentry.client.config.ts`:

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

## 🔄 Kontinuální vývoj

### Další možná rozšíření:
1. **Kupóny a slevy** - promo kódy pro kurzy
2. **Recenze kurzů** - hodnocení od účastníků
3. **Push notifikace** - připomínky kurzů
4. **Mobilní aplikace** - React Native app
5. **Integration s CRM** - propojení s firemním CMS
6. **Advanced analytics** - detailní metriky

## ✅ Checklist pro produkci

- [ ] Všechny environment proměnné nastaveny
- [ ] Database migrace dokončeny
- [ ] Stripe webhooks nakonfigurovány
- [ ] SMTP server funkční
- [ ] SSL certifikát aktivní
- [ ] Backup strategie nastavena
- [ ] Monitoring aktivní
- [ ] Performance optimalizace dokončena
- [ ] SEO meta tags všude
- [ ] Chybové stavy ošetřeny
- [ ] Loading states implementovány
- [ ] Mobile responsivita otestována
- [ ] Accessibility (A11y) ověřena

---

Tento implementation guide poskytuje strukturovaný přístup k vytvoření komplexního rezervačního systému s možností postupného rozšiřování funkcionalit.