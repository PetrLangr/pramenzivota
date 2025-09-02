# API Reference - Pramen života

Kompletní dokumentace REST API endpointů pro rezervační systém centrum energetické rovnováhy.

## 🔐 Autentizace

Systém používá **NextAuth.js** s session-based autentizací.

### Login/Logout
```typescript
// POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "password123"
}

// POST /api/auth/signout
// Invaliduje session
```

### Middleware ochrana
- `/admin/*` - pouze `ADMIN` role
- `/api/admin/*` - pouze `ADMIN` role
- Ostatní protected routes kontrolují session

## 📚 Kurzy (Courses)

### GET /api/courses
Získání seznamu kurzů s filtrováním a stránkování.

**Query parametry:**
```typescript
{
  page?: number;          // Default: 1
  limit?: number;         // Default: 10, max: 50
  status?: CourseStatus;  // PUBLISHED | DRAFT | CANCELLED
  featured?: boolean;     // Pouze featured kurzy
  tags?: string[];        // Filter podle tagů
  search?: string;        // Fulltextové vyhledávání
  from_date?: string;     // ISO string, kurzy od data
  to_date?: string;       // ISO string, kurzy do data
}
```

**Response:**
```typescript
{
  courses: Course[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    availableTags: string[];
    dateRange: {
      earliest: string;
      latest: string;
    };
  };
}
```

**Příklad:**
```bash
GET /api/courses?page=1&limit=6&status=PUBLISHED&featured=true&tags=hatha-yoga,meditace
```

### GET /api/courses/[slug]
Detail konkrétního kurzu se statistikami obsazenosti.

**Response:**
```typescript
{
  id: string;
  slug: string;
  title: string;
  shortDescription: string;
  description: string;
  startDate: string;
  endDate: string | null;
  location: string;
  capacity: number;
  priceCZK: number;
  coverImageUrl: string;
  gallery: CourseImage[];
  tags: string[];
  status: CourseStatus;
  featured: boolean;
  
  // Statistiky
  stats: {
    reservedSeats: number;
    availableSeats: number;
    occupancyPercent: number;
    isFullyBooked: boolean;
  };
  
  // SEO
  metaTitle?: string;
  metaDescription?: string;
  
  // Related kurzy
  relatedCourses: Course[];
}
```

### POST /api/courses (Admin only)
Vytvoření nového kurzu.

**Request body:**
```typescript
{
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  startDate: string; // ISO
  endDate?: string;  // ISO
  location: string;
  capacity: number;
  priceCZK: number; // V haléřích
  coverImageUrl: string;
  tags: string[];
  status?: CourseStatus; // Default: DRAFT
  featured?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}
```

### PUT /api/courses/[id] (Admin only)
Úprava existujícího kurzu.

### DELETE /api/courses/[id] (Admin only)
Smazání kurzu (pouze pokud nemá rezervace).

## 🎫 Rezervace (Reservations)

### POST /api/reservations
Vytvoření nové rezervace s následnou platbou.

**Request body:**
```typescript
{
  courseId: string;
  fullName: string;
  email: string;
  phone?: string;
  seats: number; // Default: 1
  notes?: string;
  gdprConsent: boolean; // Musí být true
  photoConsent: boolean;
}
```

**Response:**
```typescript
{
  reservationId: string;
  status: "PENDING";
  paymentUrl: string; // Stripe Checkout URL
  expiresAt: string; // ISO - platnost platby
}
```

**Workflow:**
1. Validace kapacity kurzu
2. Vytvoření rezervace se statusem `PENDING`
3. Vytvoření Stripe Checkout session
4. Přesměrování na platební bránu

### GET /api/reservations/[id]
Detail rezervace (pouze vlastník nebo admin).

**Response:**
```typescript
{
  id: string;
  courseId: string;
  course: {
    title: string;
    startDate: string;
    location: string;
    priceCZK: number;
  };
  fullName: string;
  email: string;
  phone?: string;
  seats: number;
  status: ReservationStatus;
  amountCZK?: number;
  paymentRef?: string;
  notes?: string;
  gdprConsent: boolean;
  photoConsent: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### GET /api/reservations/[id]/confirmation
Potvrzovací stránka po úspěšné platbě.

**Response:**
```typescript
{
  reservation: Reservation;
  course: Course;
  paymentStatus: "success" | "pending" | "failed";
  downloadUrl?: string; // URL pro stažení potvrzení (PDF)
}
```

## 💳 Platby (Payments)

### POST /api/payments/create-checkout-session
Vytvoření Stripe Checkout session (internal API).

**Request body:**
```typescript
{
  reservationId: string;
  courseId: string;
  amountCZK: number;
  customerEmail: string;
}
```

### POST /api/webhooks/stripe
Stripe webhook handler pro potvrzování plateb.

**Workflow:**
1. Verifikace webhook signature
2. Zpracování `checkout.session.completed` eventu
3. Update rezervace na status `PAID`
4. Odeslání confirmation e-mailu
5. Log audit trail

## 📝 Blog

### GET /api/blog/posts
Seznam blog článků.

**Query parametry:**
```typescript
{
  page?: number;
  limit?: number;
  featured?: boolean;
  tags?: string[];
  search?: string;
  author?: string;
}
```

### GET /api/blog/posts/[slug]
Detail článku.

### POST /api/blog/posts (Admin only)
Vytvoření článku.

### PUT /api/blog/posts/[id] (Admin only)
Úprava článku.

### DELETE /api/blog/posts/[id] (Admin only)
Smazání článku.

## 🖼 Galerie

### GET /api/gallery
Seznam obrázků galerie.

**Query parametry:**
```typescript
{
  category?: string;
  tags?: string[];
  featured?: boolean;
  limit?: number;
}
```

### POST /api/gallery (Admin only)
Přidání obrázku do galerie.

### DELETE /api/gallery/[id] (Admin only)
Smazání obrázku.

## 📧 Kontakt

### POST /api/contact
Odeslání kontaktního formuláře.

**Request body:**
```typescript
{
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  gdprConsent: boolean;
}
```

**Rate limiting:** 5 requests/15min per IP.

## 🔧 Admin API

### GET /api/admin/dashboard
Admin dashboard statistiky.

**Response:**
```typescript
{
  stats: {
    totalCourses: number;
    publishedCourses: number;
    totalReservations: number;
    paidReservations: number;
    monthlyRevenue: number;
    averageOccupancy: number;
  };
  
  recentReservations: Reservation[];
  upcomingCourses: Course[];
  
  charts: {
    monthlyRevenue: { month: string; amount: number }[];
    coursePopularity: { courseTitle: string; reservations: number }[];
  };
}
```

### GET /api/admin/reservations
Seznam všech rezervací s filtrováním.

**Query parametry:**
```typescript
{
  page?: number;
  limit?: number;
  status?: ReservationStatus;
  courseId?: string;
  search?: string; // email nebo jméno
  from_date?: string;
  to_date?: string;
}
```

### POST /api/admin/reservations/[id]/status
Změna statusu rezervace.

**Request body:**
```typescript
{
  status: ReservationStatus;
  adminNotes?: string;
  sendEmail?: boolean; // Poslat notifikaci klientovi
}
```

### GET /api/admin/reservations/export
Export rezervací do CSV.

**Query parametry:** Stejné jako GET /api/admin/reservations

**Response:** CSV file download

## ⚙️ Nastavení

### GET /api/admin/settings
Získání všech nastavení.

### PUT /api/admin/settings
Hromadná úprava nastavení.

**Request body:**
```typescript
{
  settings: {
    [key: string]: string;
  };
}
```

**Příklady nastavení:**
```typescript
{
  "site.title": "Pramen života s.r.o.",
  "site.description": "Centrum energetické rovnováhy",
  "contact.email": "info@pramenzivota.cz",
  "contact.phone": "+420 123 456 789",
  "payment.default_provider": "stripe",
  "email.from_name": "Pramen života",
  "booking.advance_hours": "24" // Minimální předstih rezervace
}
```

## 🚨 Error Handling

Všechny API endpointy používají konzistentní error format:

```typescript
{
  error: {
    code: string;           // "VALIDATION_ERROR", "NOT_FOUND", etc.
    message: string;        // Human readable message
    details?: any;          // Additional error details
    statusCode: number;     // HTTP status code
  }
}
```

### Běžné error kódy:
- `400` - `VALIDATION_ERROR` - Neplatná data
- `401` - `UNAUTHORIZED` - Vyžaduje přihlášení  
- `403` - `FORBIDDEN` - Nedostatečná oprávnění
- `404` - `NOT_FOUND` - Resource neexistuje
- `409` - `CONFLICT` - Konflikt (kurz plný, atd.)
- `429` - `RATE_LIMITED` - Překročený rate limit
- `500` - `INTERNAL_ERROR` - Server error

## 🔍 Validace

Všechny API endpointy používají **Zod** schémata pro validaci:

### Reservation validation
```typescript
const reservationSchema = z.object({
  courseId: z.string().cuid(),
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().optional(),
  seats: z.number().min(1).max(10),
  notes: z.string().max(1000).optional(),
  gdprConsent: z.literal(true),
  photoConsent: z.boolean()
});
```

### Course validation
```typescript
const courseSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  shortDescription: z.string().min(10).max(500),
  description: z.string().min(50),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  location: z.string().min(5).max(200),
  capacity: z.number().min(1).max(100),
  priceCZK: z.number().min(0),
  tags: z.array(z.string()).max(10)
});
```

## 📊 Rate Limiting

Pro ochranu API implementujeme rate limiting:

```typescript
const rateLimits = {
  "/api/contact": "5/15min",          // Kontaktní formulář
  "/api/reservations": "10/hour",     // Rezervace  
  "/api/auth/signin": "5/15min",      // Přihlášení
  "/api/*": "100/hour"                // Obecný limit
};
```

## 🧪 Testing

### API Testing s Jest
```typescript
// __tests__/api/courses.test.ts
describe("/api/courses", () => {
  test("should return published courses", async () => {
    const response = await request(app)
      .get("/api/courses?status=PUBLISHED")
      .expect(200);
      
    expect(response.body.courses).toBeDefined();
    expect(response.body.pagination.total).toBeGreaterThan(0);
  });
});
```

### Mock data pro testování
```typescript
// __tests__/fixtures/courses.ts
export const mockCourse = {
  title: "Test Kurz",
  slug: "test-kurz",
  shortDescription: "Testovací popis kurzu",
  // ... další properties
};
```

---

Tato API dokumentace poskytuje kompletní přehled všech dostupných endpointů a jejich použití v rezervačním systému.