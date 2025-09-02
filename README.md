# Pramen života s.r.o. - Projekt

Kompletní projekt pro Centrum energetické rovnováhy skládající se ze **statického webu** a **rezervačního systému**.

## 📁 Struktura projektu

```
pramen_zivota/
├── website/                    # 🌐 Statický HTML web (Yogastic šablona)
│   ├── index.html             # Hlavní stránka
│   ├── about.html             # O nás
│   ├── services.html          # Služby
│   ├── contact.html           # Kontakt
│   ├── assets/                # CSS, JS, obrázky
│   └── ...                    # Ostatní HTML stránky
├── docs/                      # 📚 Dokumentace rezervačního systému
│   ├── database.md           # Datový model
│   ├── api.md                # API reference
│   ├── architecture.md       # Architektura
│   ├── implementation-guide.md # Implementační návod
│   ├── payment-system.md     # Platební systém
│   └── deployment.md         # Deployment guide
└── README.md                 # Tento soubor
```

## 🌐 Statický web (/website/)

### 🎯 **Status**: ✅ **Připraveno k rebrandingu**

**Kompletní Yogastic HTML šablona** s:
- ✅ **Všechny HTML stránky** (index, about, services, contact, atd.)
- ✅ **CSS styly** (Bootstrap + custom)
- ✅ **JavaScript** (jQuery, AOS animace, ityped)
- ✅ **Obrázky a ikony** 
- ✅ **Responzivní design**

### 🔄 **Další kroky pro web:**
1. **Přejmenovat texty** z "Yogastic" na "Pramen života s.r.o."
2. **Lokalizace** z angličtiny na češtinu
3. **Změnit služby** z yoga na energetické terapie
4. **Aktualizovat kontakty** (Praha místo Melbourne)
5. **Změnit barvy** na modrou/zelenou paletu
6. **Nahradit logo** a klíčové obrázky

### 📄 **Aktuální obsah:**
- **Hero**: "Start Healing Your Mind" s typing animací
- **Services**: Prenatal Yoga, Meditation, Nutrition, Hatha Yoga  
- **About**: "Take Your Yoga to the Next Level"
- **Contact**: Kontaktní formulář + info
- **Footer**: Yogastic branding

## 💻 Rezervační systém (budoucí implementace)

### 🎯 **Status**: 📋 **Zdokumentováno, připraveno k implementaci**

**Next.js 14+ aplikace** s:
- **PostgreSQL** databáze (Prisma ORM)
- **NextAuth** autentizace s rolemi
- **Stripe/Comgate** platební systém
- **Admin panel** pro správu kurzů a rezervací
- **Email notifications** pro potvrzení
- **CSV export** rezervací
- **Standalone modul** pro CMS integraci

### 🛠 **Implementace:**
Podle dokumentace v `/docs/implementation-guide.md` - postupný návod od inicializace po produkční nasazení.

### 🔗 **Integrace se statickým webem:**
- **CTA tlačítka** na webu povedou na rezervační systém
- **Subdoména** nebo **složka** (např. rezervace.pramenzivota.cz)
- **Společný design** systém a branding

## 🚀 Quick Start

### Pro statický web:
```bash
cd website
# Otevřít index.html v prohlížeči
open index.html
```

### Pro rezervační systém:
```bash
# Podle docs/implementation-guide.md
npx create-next-app@latest reservation-system
# ... pokračovat podle guide
```

## 📚 Dokumentace

Kompletní dokumentace rezervačního systému:
- **[Database](docs/database.md)** - Datový model (Prisma schema)
- **[API](docs/api.md)** - REST API endpoints
- **[Architecture](docs/architecture.md)** - Systémová architektura
- **[Implementation](docs/implementation-guide.md)** - Postupný návod
- **[Payments](docs/payment-system.md)** - Stripe/Comgate systém
- **[Deployment](docs/deployment.md)** - Produkční nasazení

## 🎨 Design systém

### Plánované barvy (Pramen života):
- **Primární modrá**: `#1B6FD8` 
- **Přírodní zelená**: `#A7D7C5`
- **Bílá**: `#FFFFFF`
- **Šedá**: `#1F2937`, `#4B5563`

### Současné barvy (Yogastic):
- **Primární**: `#242424`
- **Sekundární**: `#764979` (fialová)
- **Accent**: `#413625`
- **Soft orange**: `#e1ccad`

## 🔄 Workflow

### Fáze 1: Statický web
1. ✅ **Yogastic šablona** připravena v `/website/`
2. **Rebrand** na Pramen života (texty, barvy, logo)
3. **Testování** a optimalizace
4. **Deploy** statického webu

### Fáze 2: Rezervační systém  
1. **Inicializace** Next.js projektu
2. **Database** setup (PostgreSQL + Prisma)
3. **Implementace** dle dokumentace
4. **Integrace** se statickým webem
5. **Deploy** rezervačního systému

---

**Aktuální stav**: ✅ **Yogastic šablona připravena, dokumentace hotova**

**Další krok**: Rebrand statického webu na "Pramen života s.r.o."