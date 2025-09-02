# Contributing Guide - Pramen života

Návod pro vývojáře a přispěvatele do projektu rezervačního systému centrum energetické rovnováhy.

## 🎯 Úvod

Tento projekt je rezervační systém pro "Pramen života s.r.o." vybudovaný v Next.js 14+ s TypeScript, PostgreSQL a moderními technologiemi. Cílem je vytvořit modulární systém, který může fungovat samostatně nebo být integrován do firemního CMS.

## 🛠 Development Setup

### Požadavky

- Node.js 18+
- PostgreSQL 12+
- Git
- pnpm/npm/yarn
- VS Code (doporučeno)

### Lokální instalace

```bash
# Clone repository
git clone https://github.com/your-org/pramen-zivota.git
cd pramen-zivota

# Instalace závislostí
npm install

# Kopírování environment variables
cp .env.example .env.local
# Upravte .env.local s vlastními hodnotami

# Database setup
npx prisma migrate dev --name init
npx prisma generate
npm run prisma:seed

# Spuštění development serveru
npm run dev
```

### Vývojové nástroje

Doporučená VS Code rozšíření:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## 📋 Coding Standards

### TypeScript Guidelines

```typescript
// ✅ Dobře - explicitní typy pro public API
export interface CourseCardProps {
  course: Course & {
    stats: {
      reservedSeats: number;
      availableSeats: number;
      occupancyPercent: number;
      isFullyBooked: boolean;
    };
  };
  variant?: 'default' | 'compact' | 'featured';
  onReserve?: (courseId: string) => void;
}

// ✅ Dobře - utility types
type CourseWithStats = Course & {
  stats: CourseCapacityStats;
};

// ❌ Špatně - any types
function processData(data: any): any {
  return data;
}

// ✅ Dobře - generic constraints
function processData<T extends { id: string }>(data: T): T {
  return data;
}
```

### React Component Patterns

```typescript
// ✅ Dobře - Server Component s explicitním async
export default async function CoursePage({ 
  params 
}: {
  params: { slug: string };
}) {
  const course = await getCourseBySlug(params.slug);
  
  if (!course) {
    notFound();
  }

  return (
    <main>
      <CourseDetail course={course} />
    </main>
  );
}

// ✅ Dobře - Client Component s 'use client'
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';

export function ReservationForm({ courseId }: { courseId: string }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // ... rest of component
}

// ✅ Dobře - Custom hooks
export function useReservation() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  const createReservation = useCallback(async (data: CreateReservationData) => {
    // Implementation
  }, []);
  
  return { reservations, createReservation };
}
```

### CSS/Tailwind Conventions

```tsx
// ✅ Dobře - logické třídy groupované
<div className={cn(
  // Layout
  "flex flex-col gap-4",
  // Appearance  
  "bg-white rounded-lg shadow-md",
  // Spacing
  "p-6 m-4",
  // Responsive
  "sm:p-8 md:flex-row",
  // Conditional
  isActive && "ring-2 ring-primary",
  className
)}>

// ❌ Špatně - dlouhá neorganizovaná řada
<div className="flex flex-col gap-4 bg-white rounded-lg shadow-md p-6 m-4 sm:p-8 md:flex-row ring-2 ring-primary">
```

### API Route Patterns

```typescript
// ✅ Dobře - strukturovaná API route
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const createCourseSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  // ... další validace
});

export async function POST(request: NextRequest) {
  try {
    // Autentizace
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validace
    const body = await request.json();
    const data = createCourseSchema.parse(body);

    // Business logika
    const course = await prisma.course.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Create course error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## 🏗 Architektura a Patterns

### Složková struktura

```
src/
├── app/                    # Next.js App Router
├── components/             # React komponenty
│   ├── ui/                # shadcn/ui generované
│   ├── layout/            # Layout komponenty
│   ├── marketing/         # Homepage sekce
│   ├── forms/             # Formulářové komponenty
│   └── admin/             # Admin komponenty
├── lib/                   # Utility knihovny
│   ├── validators/        # Zod schémata
│   ├── payments/          # Payment systém
│   └── mailer/            # Email systém
├── hooks/                 # Custom React hooks
├── types/                 # TypeScript definice
└── styles/                # CSS styly
```

### Naming Conventions

```typescript
// Files - kebab-case
course-card.tsx
reservation-form.tsx
payment-provider.ts

// Components - PascalCase
export function CourseCard() {}
export function ReservationForm() {}

// Functions/variables - camelCase
const getCourseBySlug = () => {}
const isUserAdmin = () => {}

// Constants - SCREAMING_SNAKE_CASE
const DEFAULT_PAGE_SIZE = 10;
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

// Types/Interfaces - PascalCase
interface CourseCardProps {}
type ReservationStatus = 'PENDING' | 'PAID' | 'CANCELLED';
```

### Error Handling Patterns

```typescript
// ✅ Dobře - custom error classes
export class ValidationError extends Error {
  constructor(
    message: string,
    public field: string,
    public code: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PaymentError extends Error {
  constructor(
    message: string,
    public provider: string,
    public paymentRef?: string
  ) {
    super(message);
    this.name = 'PaymentError';
  }
}

// ✅ Dobře - error boundary
'use client';

import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }: any) {
  return (
    <div className="p-6 text-center">
      <h2 className="text-lg font-semibold text-red-600 mb-2">
        Něco se pokazilo
      </h2>
      <p className="text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={resetErrorBoundary}
        className="btn btn-primary"
      >
        Zkusit znovu
      </button>
    </div>
  );
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
```

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// __tests__/lib/format/currency.test.ts
import { formatCurrencyCZK } from '@/lib/format/currency';

describe('formatCurrencyCZK', () => {
  it('formats Czech currency correctly', () => {
    expect(formatCurrencyCZK(50000)).toBe('500 Kč');
    expect(formatCurrencyCZK(150000)).toBe('1 500 Kč');
    expect(formatCurrencyCZK(0)).toBe('0 Kč');
  });

  it('handles negative amounts', () => {
    expect(formatCurrencyCZK(-50000)).toBe('-500 Kč');
  });
});
```

### Component Tests

```typescript
// __tests__/components/course-card.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CourseCard } from '@/components/courses/course-card';
import { mockCourse } from '@/test/fixtures/courses';

describe('CourseCard', () => {
  const defaultProps = {
    course: mockCourse,
  };

  it('renders course information', () => {
    render(<CourseCard {...defaultProps} />);
    
    expect(screen.getByText(mockCourse.title)).toBeInTheDocument();
    expect(screen.getByText(mockCourse.shortDescription)).toBeInTheDocument();
  });

  it('calls onReserve when reserve button is clicked', async () => {
    const user = userEvent.setup();
    const onReserve = jest.fn();
    
    render(<CourseCard {...defaultProps} onReserve={onReserve} />);
    
    const reserveButton = screen.getByRole('button', { name: /rezervovat/i });
    await user.click(reserveButton);
    
    expect(onReserve).toHaveBeenCalledWith(mockCourse.id);
  });

  it('shows full booking indicator when course is fully booked', () => {
    const fullyCourse = {
      ...mockCourse,
      stats: { ...mockCourse.stats, isFullyBooked: true }
    };
    
    render(<CourseCard course={fullyCourse} />);
    
    expect(screen.getByText(/obsazeno/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rezervovat/i })).toBeDisabled();
  });
});
```

### API Tests

```typescript
// __tests__/api/courses.test.ts
import { createMocks } from 'node-mocks-http';
import handler from '@/app/api/courses/route';
import { prismaMock } from '@/test/mocks/prisma';

describe('/api/courses', () => {
  beforeEach(() => {
    prismaMock.course.findMany.mockClear();
  });

  it('returns courses with pagination', async () => {
    const mockCourses = [
      { id: '1', title: 'Test Course 1', /* ... */ },
      { id: '2', title: 'Test Course 2', /* ... */ },
    ];

    prismaMock.course.findMany.mockResolvedValue(mockCourses);
    prismaMock.course.count.mockResolvedValue(2);

    const { req, res } = createMocks({
      method: 'GET',
      query: { page: '1', limit: '10' },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data.courses).toHaveLength(2);
    expect(data.pagination.total).toBe(2);
  });
});
```

### Test Utilities

```typescript
// test/fixtures/courses.ts
import { Course } from '@prisma/client';

export const mockCourse: Course & { stats: any } = {
  id: 'course-1',
  slug: 'test-course',
  title: 'Test Course',
  shortDescription: 'Test description',
  description: 'Long test description',
  startDate: new Date('2024-04-15T18:00:00'),
  endDate: new Date('2024-04-15T19:30:00'),
  location: 'Test Location',
  capacity: 10,
  priceCZK: 50000,
  coverImageUrl: 'https://example.com/image.jpg',
  tags: ['test'],
  status: 'PUBLISHED',
  featured: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  stats: {
    reservedSeats: 3,
    availableSeats: 7,
    occupancyPercent: 30,
    isFullyBooked: false,
  },
};
```

## 📝 Git Workflow

### Branch Strategy

```bash
main                 # Produkční branch
├── develop         # Development branch
├── feature/*       # Feature branches
├── bugfix/*        # Bugfix branches
└── hotfix/*        # Hotfix branches
```

### Commit Messages

Používáme **Conventional Commits**:

```bash
# Format
type(scope): description

# Typy
feat: nová funkcionalita
fix: oprava chyby
docs: dokumentace
style: formátování (nezměna logiky)
refactor: refaktorizace kódu
test: testy
chore: maintenance úkoly

# Příklady
feat(courses): add course filtering by tags
fix(payments): handle stripe webhook timeout
docs(api): update reservation endpoints documentation
refactor(components): extract common form validation logic
test(reservations): add e2e reservation flow tests
```

### Pull Request Guidelines

#### PR Template

```markdown
## Popis změn
Stručný popis toho, co tento PR řeší.

## Typ změny
- [ ] Bug fix
- [ ] Nová funkcionalita
- [ ] Breaking change
- [ ] Dokumentace

## Checklist
- [ ] Kód prošel self-review
- [ ] Testy jsou přidány/aktualizovány
- [ ] Dokumentace je aktualizována
- [ ] ESLint/Prettier prošly bez chyb
- [ ] TypeScript kompilace bez chyb
- [ ] Testy procházejí

## Testing
Popis jak otestovat změny:

1. Kroky pro reprodukci
2. Očekávané chování
3. Prostředí pro testování

## Screenshots
Pokud je relevantní, přiložte screenshoty.
```

#### Review Process

1. **Self-review** - před vytvořením PR
2. **Automated checks** - ESLint, TypeScript, testy
3. **Peer review** - minimálně 1 schválení
4. **Manual testing** - ověření funkcionality
5. **Merge** - squash commit do main/develop

## 🚀 Release Process

### Versioning

Používáme **Semantic Versioning** (SemVer):

```
MAJOR.MINOR.PATCH

1.0.0 - Initial release
1.0.1 - Patch (bugfixy)
1.1.0 - Minor (nové funkce, backwards compatible)
2.0.0 - Major (breaking changes)
```

### Release Checklist

#### Pre-release
- [ ] Všechny features jsou dokončené
- [ ] Všechny testy procházejí
- [ ] Documentation je aktualizována
- [ ] Database migrace jsou připraveny
- [ ] Environment variables jsou zdokumentovány

#### Release
- [ ] Vytvoření release branch
- [ ] Update version v package.json
- [ ] Generování changelog
- [ ] Testing na staging prostředí
- [ ] Vytvoření Git tagu
- [ ] Deploy do produkce

#### Post-release
- [ ] Verifikace funkcionality v produkci
- [ ] Monitoring chyb
- [ ] User feedback collection
- [ ] Merge release branch zpět do develop

## 📖 Documentation Standards

### Code Comments

```typescript
/**
 * Vytvoří novou rezervace pro zadaný kurz.
 * 
 * @param courseId - ID kurzu pro rezervaci
 * @param reservationData - Data pro vytvoření rezervace
 * @returns Promise s vytvořenou rezervací
 * @throws {ValidationError} Když jsou data nevalidní
 * @throws {CapacityError} Když je kurz plný
 * 
 * @example
 * ```typescript
 * const reservation = await createReservation('course-123', {
 *   fullName: 'Jan Novák',
 *   email: 'jan@example.com',
 *   seats: 1
 * });
 * ```
 */
export async function createReservation(
  courseId: string,
  reservationData: CreateReservationData
): Promise<Reservation> {
  // Implementation
}
```

### API Documentation

```typescript
/**
 * @api {get} /api/courses Získání seznamu kurzů
 * @apiName GetCourses
 * @apiGroup Courses
 * 
 * @apiParam {Number} [page=1] Stránka
 * @apiParam {Number} [limit=10] Počet kurzů na stránku
 * @apiParam {String} [status] Filter podle stavu kurzu
 * @apiParam {Boolean} [featured] Pouze featured kurzy
 * 
 * @apiSuccess {Object[]} courses Seznam kurzů
 * @apiSuccess {Object} pagination Informace o stránkování
 * 
 * @apiSuccessExample {json} Success Response:
 * {
 *   "courses": [...],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 25,
 *     "totalPages": 3
 *   }
 * }
 */
```

## 🔧 Performance Guidelines

### Core Web Vitals

Naše cíle:
- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms  
- **CLS** (Cumulative Layout Shift): < 0.1

### Optimalizace pravidla

```typescript
// ✅ Dobře - lazy loading pro komponenty pod fold
const GallerySection = lazy(() => import('@/components/marketing/gallery'));

// ✅ Dobře - optimalizované obrázky
import Image from 'next/image';

<Image
  src={course.coverImageUrl}
  alt={course.title}
  width={800}
  height={400}
  priority={index < 3} // První 3 obrázky jako priority
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// ✅ Dobře - memoization pro expensive computations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// ✅ Dobře - debounced search
const debouncedSearch = useDebouncedCallback(
  (searchTerm: string) => {
    fetchResults(searchTerm);
  },
  300
);
```

## 🐛 Debugging Guidelines

### Error Logging

```typescript
// ✅ Dobře - strukturované error logování
const logger = {
  error: (message: string, meta?: Record<string, any>) => {
    console.error('[ERROR]', message, {
      timestamp: new Date().toISOString(),
      ...meta,
    });
    
    // V produkci pošli do Sentry
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(new Error(message), {
        extra: meta,
      });
    }
  },
  
  info: (message: string, meta?: Record<string, any>) => {
    console.info('[INFO]', message, meta);
  },
};
```

### Development Tools

```typescript
// Development helper pro debugging state
if (process.env.NODE_ENV === 'development') {
  (window as any).__DEBUG__ = {
    reservations: () => console.table(reservations),
    courses: () => console.table(courses),
    clearCache: () => queryClient.clear(),
  };
}
```

## 🤝 Community Guidelines

### Code of Conduct

- Buďte vždy respektující a profesionální
- Konstruktivní feedback nad kritikou
- Pomáhejte začínajícím vývojářům
- Zdieľajte znalosti a best practices

### Communication Channels

- **Issues** - bug reports, feature requests
- **Discussions** - obecné diskuse, otázky
- **Pull Requests** - code review, návrhy změn
- **Wiki** - dlouhodobá dokumentace

### Getting Help

1. Projděte si dokumentaci
2. Hledejte v existujících issues
3. Pokud problém přetrvává, vytvořte nové issue s:
   - Jasným popisem problému
   - Kroky k reprodukci
   - Očekávané vs. aktuální chování
   - Environment info (OS, Node.js verze, atd.)

---

Děkujeme za příspěvek k projektu! Každý příspěvek, ať už je to kód, dokumentace nebo hlášení chyb, je vítán a oceněn.