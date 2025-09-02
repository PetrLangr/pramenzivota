# Oprava layoutu - Hero sekce

## 🎯 **Problém:**
Hero text byl příliš vpravo kvůli nadměrnému left paddingu.

## ✅ **Opraveno:**

### CSS změny v `/website/assets/css/style.css`:
```css
/* Původní - příliš velké odsazení */
.banner-section-outer .banner-section {
    padding: 50px 292px 138px;  /* ← 292px bylo moc! */
}
.main_header {    
    padding: 42px 292px 0;      /* ← 292px bylo moc! */
}
.navbar-nav {
    padding-left: 220px;       /* ← 220px bylo moc! */
}

/* Nové - rozumné odsazení */
.banner-section-outer .banner-section {
    padding: 50px 80px 138px;   /* ← 80px je lepší */
}
.main_header {    
    padding: 42px 80px 0;       /* ← 80px je lepší */
}
.navbar-nav {
    padding-left: 80px;        /* ← 80px je lepší */
}
```

### Media queries v `/website/assets/css/mediaqueries.css`:
```css
/* Pro 1440px a menší */
.main_header {
    padding: 35px 60px 0;       /* Sníženo z 85px na 60px */
}
.navbar-nav {
    padding-left: 60px;        /* Sníženo z 90px na 60px */
}
.banner-section-outer .banner-section {
    padding: 50px 60px 138px;   /* Sníženo z 85px na 60px */
}
```

## 🎨 **Výsledek:**
- ✅ **Hero text** je nyní **více vlevo** a lépe vycentrovaný
- ✅ **Navigace** má rozumné odsazení
- ✅ **Responzivní design** zachován
- ✅ **Proporce** jsou teď vyváženější

**Zkontrolujte web** - hero text by měl být nyní lépe umístěný!