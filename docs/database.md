# Datový model - Pramen života

Detailní popis databázového schématu pro rezervační systém centrum energetické rovnováhy.

## 🗄 Prisma Schema

### Kompletní schema.prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== ENUMS =====

enum Role {
  ADMIN
  USER
}

enum ReservationStatus {
  PENDING    // Čekající na platbu
  PAID       // Zaplaceno
  CANCELLED  // Zrušeno
}

enum CourseStatus {
  DRAFT      // Koncept
  PUBLISHED  // Publikováno
  CANCELLED  // Zrušeno
  COMPLETED  // Dokončeno
}

// ===== MODELS =====

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String
  name          String?
  phone         String?
  role          Role     @default(USER)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Vztahy
  reservations  Reservation[]
  posts         Post[]

  @@index([role])
  @@index([email])
}

model Course {
  id              String        @id @default(cuid())
  slug            String        @unique
  title           String
  shortDescription String       @db.Text
  description     String        @db.Text
  
  // Datum a čas
  startDate       DateTime
  endDate         DateTime?
  
  // Lokace a kapacita
  location        String
  capacity        Int
  
  // Cena v haléřích (pro přesnost)
  priceCZK        Int
  
  // Obrázky
  coverImageUrl   String
  gallery         CourseImage[]
  
  // Metadata
  tags            String[]      // ["meditace", "breathwork", "hatha-yoga"]
  status          CourseStatus  @default(DRAFT)
  featured        Boolean       @default(false)
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  // Timestamps
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  // Vztahy
  reservations    Reservation[]

  @@index([status, featured])
  @@index([startDate])
  @@index([tags])
  @@index([slug])
}

model CourseImage {
  id        String  @id @default(cuid())
  courseId  String
  url       String
  alt       String?
  position  Int     @default(0)
  createdAt DateTime @default(now())

  // Vztahy
  Course    Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@index([courseId, position])
}

model Reservation {
  id          String            @id @default(cuid())
  courseId    String
  userId      String?           // Neregistrovaní uživatelé mohou rezervovat
  
  // Kontaktní údaje
  fullName    String
  email       String
  phone       String?
  
  // Rezervace detaily
  seats       Int               @default(1)
  status      ReservationStatus @default(PENDING)
  
  // Platba
  paymentRef  String?           // Stripe payment intent ID
  amountCZK   Int?              // Částka v haléřích
  
  // Poznámky
  notes       String?           @db.Text
  adminNotes  String?           @db.Text
  
  // Souhlasy
  gdprConsent Boolean           @default(false)
  photoConsent Boolean          @default(false)
  
  // Timestamps
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  // Vztahy
  Course      Course            @relation(fields: [courseId], references: [id], onDelete: Cascade)
  User        User?             @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([courseId, status])
  @@index([email])
  @@index([status])
  @@index([createdAt])
}

model Post {
  id            String   @id @default(cuid())
  slug          String   @unique
  title         String
  excerpt       String   @db.Text
  content       String   @db.Text     // Markdown content
  coverImageUrl String
  
  // Publishing
  publishedAt   DateTime @default(now())
  featured      Boolean  @default(false)
  
  // Categorization
  tags          String[]
  
  // SEO
  metaTitle       String?
  metaDescription String?
  
  // Author
  authorId      String?
  
  // Timestamps
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Vztahy
  author        User?    @relation(fields: [authorId], references: [id], onDelete: SetNull)

  @@index([publishedAt, featured])
  @@index([tags])
  @@index([slug])
}

model GalleryImage {
  id          String   @id @default(cuid())
  url         String
  alt         String?
  description String?  @db.Text
  
  // Categorization
  tags        String[]
  category    String?  // "kurzy", "centrum", "priroda", "lide"
  
  // Display
  featured    Boolean  @default(false)
  position    Int      @default(0)
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category, featured])
  @@index([tags])
  @@index([position])
}

model LegalPage {
  id        String   @id @default(cuid())
  slug      String   @unique // "gdpr", "obchodni-podminky", "cookies", "souhlas-s-focenim"
  title     String
  content   String   @db.Text // Rich text/Markdown content
  
  // Versioning
  version   String   @default("1.0")
  effective DateTime @default(now()) // Datum účinnosti
  
  // Timestamps
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@index([effective])
}

model Setting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String   @db.Text
  description String?  @db.Text
  
  // Grouping
  category    String   @default("general") // "general", "payment", "email", "seo"
  
  // Timestamps
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([category])
}

// ===== VÝČTY PRO NASTAVENÍ =====

model PaymentProvider {
  id        String  @id @default(cuid())
  name      String  @unique // "stripe", "comgate"
  enabled   Boolean @default(false)
  config    Json    // Provider-specific configuration
  isDefault Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model EmailTemplate {
  id          String @id @default(cuid())
  name        String @unique // "reservation-confirmation", "course-reminder"
  subject     String
  htmlContent String @db.Text
  textContent String @db.Text
  variables   Json   // Available template variables
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 📊 Vztahy a indexy

### Klíčové vztahy
- **User** → **Reservation** (1:N) - Uživatel může mít více rezervací
- **Course** → **Reservation** (1:N) - Kurz může mít více rezervací
- **Course** → **CourseImage** (1:N) - Kurz může mít galerii obrázků
- **User** → **Post** (1:N) - Autor může napsat více článků

### Optimalizační indexy
- **Compound indexy** pro často dotazované kombinace
- **Status indexy** pro filtrování podle stavu
- **Timestamp indexy** pro řazení podle data
- **Fulltextové indexy** pro vyhledávání (PostgreSQL)

## 🔄 Stavy a životní cykly

### Reservation Lifecycle
```
PENDING → PAID → [kurz se koná]
    ↓
CANCELLED (kdykoliv před kurzem)
```

### Course Lifecycle
```
DRAFT → PUBLISHED → COMPLETED
    ↓       ↓
CANCELLED   CANCELLED
```

## 💾 Seed data struktura

### Ukázkové kurzy
```typescript
// prisma/seed.ts
const courses = [
  {
    slug: "hatha-yoga-pro-zacatecniky",
    title: "Hatha Yoga pro začátečníky",
    shortDescription: "Jemný úvod do světa jógy zaměřený na základní pozice a dýchání",
    description: "Kompletnění popis kurzu...",
    startDate: new Date("2024-03-15T18:00:00"),
    endDate: new Date("2024-03-15T19:30:00"),
    location: "Studio Pramen života, Praha",
    capacity: 12,
    priceCZK: 50000, // 500 CZK v haléřích
    coverImageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4",
    tags: ["hatha-yoga", "zacatecnici", "dychani"],
    status: "PUBLISHED",
    featured: true
  }
  // ... další kurzy
];
```

### Testovací uživatelé
```typescript
const users = [
  {
    email: "admin@pramenzivota.cz",
    passwordHash: await bcrypt.hash("Admin123!", 12),
    name: "Systémový administrátor",
    role: "ADMIN"
  },
  {
    email: "uzivatel@example.com", 
    passwordHash: await bcrypt.hash("User123!", 12),
    name: "Testovací uživatel",
    role: "USER"
  }
];
```

### Právní stránky
```typescript
const legalPages = [
  {
    slug: "gdpr",
    title: "Ochrana osobních údajů (GDPR)",
    content: "# GDPR\n\nDetailní informace o zpracování osobních údajů..."
  },
  {
    slug: "obchodni-podminky", 
    title: "Obchodní podmínky",
    content: "# Obchodní podmínky\n\n1. Základní ustanovení..."
  },
  {
    slug: "cookies",
    title: "Zásady používání cookies", 
    content: "# Cookies\n\nInformace o používání cookies..."
  },
  {
    slug: "souhlas-s-focenim",
    title: "Souhlas s pořizováním fotografií",
    content: "# Souhlas s focením\n\nPodmínky fotografování během kurzů..."
  }
];
```

## 🔍 Často používané dotazy

### Získání aktivních kurzů
```typescript
const activeCourses = await prisma.course.findMany({
  where: {
    status: 'PUBLISHED',
    startDate: {
      gte: new Date()
    }
  },
  include: {
    _count: {
      select: {
        reservations: {
          where: {
            status: 'PAID'
          }
        }
      }
    }
  },
  orderBy: {
    startDate: 'asc'
  }
});
```

### Dashboard statistiky
```typescript
const stats = await prisma.$transaction([
  // Celkový počet kurzů
  prisma.course.count({
    where: { status: 'PUBLISHED' }
  }),
  
  // Celkový počet rezervací
  prisma.reservation.count({
    where: { status: 'PAID' }
  }),
  
  // Měsíční tržby
  prisma.reservation.aggregate({
    where: {
      status: 'PAID',
      createdAt: {
        gte: startOfMonth(new Date()),
        lte: endOfMonth(new Date())
      }
    },
    _sum: {
      amountCZK: true
    }
  })
]);
```

### Kontrola kapacity kurzu
```typescript
const courseWithCapacity = await prisma.course.findUnique({
  where: { id: courseId },
  include: {
    reservations: {
      where: {
        status: 'PAID'
      }
    }
  }
});

const occupiedSeats = courseWithCapacity.reservations
  .reduce((sum, res) => sum + res.seats, 0);
const availableSeats = courseWithCapacity.capacity - occupiedSeats;
```

## 🚀 Migrace a údržba

### Vytvoření migrace
```bash
npx prisma migrate dev --name add_course_status
```

### Reset databáze (development)
```bash
npx prisma migrate reset
npx prisma generate
npx prisma db seed
```

### Backup databáze
```bash
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql
```

## 🔐 Zabezpečení dat

### Row Level Security (RLS)
Pro produkci doporučujeme implementovat RLS politiky:

```sql
-- Uživatelé mohou vidět pouze své rezervace
CREATE POLICY user_reservations ON reservations
  FOR SELECT USING (auth.user_id() = user_id OR auth.is_admin());

-- Pouze admini mohou měnit kurzy  
CREATE POLICY admin_courses ON courses
  FOR ALL USING (auth.is_admin());
```

### Audit log
```typescript
model AuditLog {
  id        String   @id @default(cuid())
  userId    String?
  action    String   // "CREATE", "UPDATE", "DELETE"
  table     String   // "Course", "Reservation", etc.
  recordId  String
  changes   Json?    // Old vs new values
  createdAt DateTime @default(now())
}
```

---

Tato databázová struktura poskytuje solidní základ pro rezervační systém s možnostmi rozšíření o další funkcionality jako jsou kupóny, notifikace, recenze kurzů a další.