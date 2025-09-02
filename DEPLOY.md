# Nasazení na Vercel

## Rychlé nasazení
1. Přihlaste se na [vercel.com](https://vercel.com)
2. Klikněte na "New Project" 
3. Importujte tento GitHub repo NEBO nahrajte ZIP soubor
4. Vercel automaticky detekuje `vercel.json` konfiguraci
5. Klikněte "Deploy"

## CLI nasazení (alternativa)
```bash
# Nainstalujte Vercel CLI (jednou)
npm i -g vercel

# V této složce spusťte
vercel

# Pro produkční verzi
vercel --prod
```

## Co je připraveno
- ✅ `vercel.json` konfigurace
- ✅ Statické soubory v `website/` složce
- ✅ Administrace zakomentována (nebude dostupná online)
- ✅ Všechny assety a obrázky jsou relativní cesty

## URL struktura po nasazení
- `https://vas-projekt.vercel.app/` → homepage
- `https://vas-projekt.vercel.app/services.html` → služby
- `https://vas-projekt.vercel.app/about.html` → o nás
- atd.

Projekt je připraven k nasazení jako statické demo!